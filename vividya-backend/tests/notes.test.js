import './setup.js';
import request from 'supertest';
import User from '../models/User.js';
import UploadedNote from '../models/UploadedNote.js';

const { default: app } = await import('../app.js');

describe('Notes Endpoints', () => {
  let userToken;
  let userId;

  const testUser = {
    email: 'notestest@college.edu',
    password: 'Password123!',
    fullName: 'Notes Student',
  };

  beforeEach(async () => {
    // Signup user and grab tokens
    const signupRes = await request(app)
      .post('/auth/signup')
      .send(testUser);

    userId = signupRes.body.data.userId;
    userToken = signupRes.body.data.accessToken;
  });

  describe('POST /notes/upload', () => {
    it('should successfully upload and analyze a PDF note', async () => {
      const mockPdf = Buffer.from('%PDF-1.4 ... mock pdf header and content ...');
      const res = await request(app)
        .post('/notes/upload')
        .set('Authorization', `Bearer ${userToken}`)
        .attach('file', mockPdf, 'notes.pdf')
        .field('subject', 'Algorithms')
        .field('chapter', '3')
        .field('branch', 'Computer Science');

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('noteId');
      expect(res.body.data.filename).toBe('notes.pdf');
      expect(res.body.data.summary).toBe('This note covers basic data structures like stack and queue.');

      // Check DB
      const note = await UploadedNote.findById(res.body.data.noteId);
      expect(note).toBeTruthy();
      expect(note.fileType).toBe('pdf');
      expect(note.metadata.subject).toBe('Algorithms');
      expect(note.metadata.chapter).toBe(3);
    });

    it('should successfully upload and analyze an image note', async () => {
      const mockImage = Buffer.from('mock-image-data-bytes');
      const res = await request(app)
        .post('/notes/upload')
        .set('Authorization', `Bearer ${userToken}`)
        .attach('file', mockImage, 'receipt.png')
        .field('subject', 'Physics');

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.filename).toBe('receipt.png');

      const note = await UploadedNote.findById(res.body.data.noteId);
      expect(note).toBeTruthy();
      expect(note.fileType).toBe('image');
    });

    it('should fail note upload when exceeding limits or missing fields', async () => {
      const res = await request(app)
        .post('/notes/upload')
        .set('Authorization', `Bearer ${userToken}`)
        .send({}); // missing file

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET, LIST, and DELETE notes', () => {
    let noteId;

    beforeEach(async () => {
      const mockPdf = Buffer.from('%PDF-1.4 ...');
      const uploadRes = await request(app)
        .post('/notes/upload')
        .set('Authorization', `Bearer ${userToken}`)
        .attach('file', mockPdf, 'test.pdf')
        .field('subject', 'DBMS');

      noteId = uploadRes.body.data.noteId;
    });

    it('should list user notes', async () => {
      const res = await request(app)
        .get('/notes')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.notes.length).toBe(1);
      expect(res.body.data.total).toBe(1);
    });

    it('should retrieve a specific note details without binary data', async () => {
      const res = await request(app)
        .get(`/notes/${noteId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).not.toHaveProperty('fileData');
      expect(res.body.data.filename).toBe('test.pdf');
    });

    it('should retrieve the raw file of a note', async () => {
      const res = await request(app)
        .get(`/notes/${noteId}/file`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/pdf');
      expect(res.body.toString()).toContain('%PDF-1.4');
    });

    it('should delete a note successfully', async () => {
      const res = await request(app)
        .delete(`/notes/${noteId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify deletion in DB
      const deletedNote = await UploadedNote.findById(noteId);
      expect(deletedNote).toBeNull();
    });
  });
});
