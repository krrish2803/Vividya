import { QdrantClient } from '@qdrant/js-client-rest';
import * as nvidiaService from './nvidiaService.js';
import { extractText } from './noteService.js';
import { BadRequestError } from '../utils/error-handler.js';
import logger from '../utils/logger.js';

const VECTOR_DIM = 1024;

const qdrant = new QdrantClient({
  url: process.env.QDRANT_CLUSTER_ENDPOINT || process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

const COLLECTION = process.env.QDRANT_COLLECTION || 'vividya_notes';

export const initQdrantCollection = async () => {
  try {
    const collections = await qdrant.getCollections();
    const exists = collections.collections.some(c => c.name === COLLECTION);

    if (!exists) {
      await qdrant.createCollection(COLLECTION, {
        vectors: { size: VECTOR_DIM, distance: 'Cosine' },
      });
      logger.info(`Created Qdrant collection: ${COLLECTION}`);
    }

    try {
      await qdrant.createPayloadIndex(COLLECTION, {
        field_name: 'userId',
        field_schema: 'keyword',
      });
      logger.info('Payload index on userId ready');
    } catch (idxErr) {
      if (!idxErr.message?.includes('already exists')) {
        logger.warn(`Payload index warning: ${idxErr.message}`);
      }
    }

    logger.info(`Qdrant collection ready: ${COLLECTION}`);
  } catch (err) {
    logger.error(`Qdrant init failed: ${err.message}`);
    throw err;
  }
};

function chunkText(text, maxTokens = 500) {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks = [];
  let currentChunk = [];
  let currentTokenCount = 0;

  for (const sentence of sentences) {
    const tokenCount = Math.ceil(sentence.length / 4);
    if (currentTokenCount + tokenCount > maxTokens && currentChunk.length > 0) {
      chunks.push(currentChunk.join(' '));
      const overlapChunk = currentChunk.slice(-Math.ceil(currentChunk.length * 0.2));
      currentChunk = overlapChunk;
      currentTokenCount = Math.ceil(overlapChunk.join(' ').length / 4);
    }
    currentChunk.push(sentence);
    currentTokenCount += tokenCount;
  }
  if (currentChunk.length > 0) chunks.push(currentChunk.join(' '));
  return chunks;
}

function generatePointId() {
  return Date.now() * 1000 + Math.floor(Math.random() * 1000);
}

export const indexDocument = async (userId, text, metadata = {}) => {
  const chunks = chunkText(text);
  const points = [];

  for (let i = 0; i < chunks.length; i++) {
    const embedding = await nvidiaService.generateEmbedding(chunks[i]);
    if (embedding) {
      points.push({
        id: generatePointId(),
        vector: embedding,
        payload: {
          userId,
          text: chunks[i],
          chunkIndex: i,
          totalChunks: chunks.length,
          filename: metadata.filename || 'Unknown',
          subject: metadata.subject || detectSubject(chunks[i]),
          uploadedAt: metadata.uploadedAt?.toISOString() || new Date().toISOString(),
        },
      });
    }
  }

  if (points.length > 0) {
    await qdrant.upsert(COLLECTION, { points });
  }

  logger.info(`Indexed ${points.length}/${chunks.length} chunks to Qdrant for user ${userId}`);
  return { chunksIndexed: points.length, totalChunks: chunks.length };
};

function detectSubject(text) {
  const msg = text.toLowerCase();
  const subjectMap = {
    'Data Structures': ['array', 'linked list', 'stack', 'queue', 'tree', 'graph', 'hash', 'heap', 'bst', 'sorting', 'searching'],
    'Algorithms': ['algorithm', 'recursion', 'dynamic programming', 'greedy', 'complexity', 'big o', 'divide and conquer'],
    'DBMS': ['database', 'sql', 'query', 'table', 'join', 'normalization', 'transaction', 'acid'],
    'Operating Systems': ['process', 'thread', 'scheduling', 'deadlock', 'memory', 'paging', 'semaphore'],
    'Computer Networks': ['tcp', 'udp', 'http', 'dns', 'osi', 'routing', 'socket', 'protocol'],
    'Machine Learning': ['machine learning', 'neural network', 'regression', 'classification', 'deep learning'],
    'Physics': ['newton', 'velocity', 'acceleration', 'force', 'energy', 'quantum'],
    'Mathematics': ['calculus', 'algebra', 'probability', 'statistics', 'matrix', 'derivative'],
  };

  for (const [subject, keywords] of Object.entries(subjectMap)) {
    if (keywords.some(kw => msg.includes(kw))) return subject;
  }
  return 'General';
}

export const retrieveContext = async (userId, query, topK = 5) => {
  const queryEmbedding = await nvidiaService.generateEmbedding(query, 'query');
  if (!queryEmbedding) return { context: '', sources: [], topScore: 0 };

  const results = await qdrant.search(COLLECTION, {
    vector: queryEmbedding,
    limit: topK,
    filter: {
      must: [{ key: 'userId', match: { value: userId } }],
    },
    with_payload: true,
  });

  if (!results.length) return { context: '', sources: [], topScore: 0 };

  // Build context with source markers
  const contextParts = results.map((r, i) =>
    `[Source ${i + 1}: ${r.payload.filename} (chunk ${r.payload.chunkIndex + 1}/${r.payload.totalChunks || '?'})]\n${r.payload.text}`
  );

  const sources = results.map((r, i) => ({
    index: i + 1,
    id: r.id,
    score: parseFloat(r.score.toFixed(4)),
    filename: r.payload.filename,
    chunkIndex: r.payload.chunkIndex,
    totalChunks: r.payload.totalChunks || 0,
    subject: r.payload.subject || 'Unknown',
    snippet: r.payload.text.substring(0, 150) + '...',
  }));

  return {
    context: contextParts.join('\n\n---\n\n'),
    sources,
    topScore: results[0].score,
  };
};

export const queryWithRAG = async (userId, query, language = 'en') => {
  const { context, sources, topScore } = await retrieveContext(userId, query);

  if (!context) {
    // No indexed docs — answer directly
    const response = await nvidiaService.generateTutorResponse(query, '', language);
    return { answer: response.text, sources: [], usingRAG: false, topScore: 0 };
  }

  // Build RAG prompt with citation instructions
  const sourceSummary = sources.map(s =>
    `Source ${s.index}: "${s.filename}" (subject: ${s.subject}, relevance: ${s.score})`
  ).join('\n');

  const prompt = `You are Vividya, an AI tutor. Answer using ONLY the provided student notes as context.

RULES:
1. ALWAYS cite your sources. Use the format: [Source X] where X is the source number.
2. Start your answer by mentioning which note(s) you're referencing.
3. If multiple sources support your answer, cite all of them.
4. If the notes don't contain enough info, say "Based on your notes, I found partial information..." and provide what you can.
5. Keep answer concise (200-300 words max).
6. At the end, list which sources you cited.

Available sources:
${sourceSummary}

Student notes context:
---
${context}
---

Student question: ${query}

Answer with citations:`;

  const response = await nvidiaService.generateTutorResponse(prompt, '', language);

  // Build formatted answer with source citation summary
  let formattedAnswer = response.text;

  // Append source citation footer if not already present
  if (!formattedAnswer.includes('Source') && sources.length > 0) {
    const citedSources = sources.slice(0, 3).map(s =>
      `"${s.filename}" (${s.subject})`
    ).join(', ');
    formattedAnswer += `\n\n📚 Sources: ${citedSources}`;
  }

  return {
    answer: formattedAnswer,
    sources,
    usingRAG: true,
    topScore: parseFloat(topScore.toFixed(4)),
  };
};

export const indexUploadedNote = async (userId, fileBuffer, mimeType, filename) => {
  let text;
  if (mimeType === 'application/pdf') {
    const pdfParse = (await import('pdf-parse')).default;
    const data = await pdfParse(fileBuffer);
    text = data.text;
  } else {
    text = await extractText(fileBuffer, 'image');
  }

  if (!text || text.trim().length < 5) throw new BadRequestError('Could not extract text');

  const result = await indexDocument(userId, text, { filename, uploadedAt: new Date() });
  return { filename, ...result };
};

export const getIndexedDocs = async (userId) => {
  try {
    const results = await qdrant.scroll(COLLECTION, {
      filter: { must: [{ key: 'userId', match: { value: userId } }] },
      with_payload: true,
      with_vector: false,
      limit: 10000,
    });

    const docs = new Map();
    (results.points || []).forEach(point => {
      const name = point.payload?.filename || 'Unknown';
      if (!docs.has(name)) {
        docs.set(name, {
          filename: name,
          chunks: 0,
          uploadedAt: point.payload?.uploadedAt,
          subject: point.payload?.subject || 'Unknown',
        });
      }
      docs.get(name).chunks++;
    });

    return [...docs.values()];
  } catch (err) {
    logger.error(`Qdrant scroll error: ${err.message}`);
    return [];
  }
};
