import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FaHeart, FaBrain, FaFire, FaChartLine, FaLightbulb } from 'react-icons/fa';

const moodEmojis = ['', '😢', '😟', '😐', '😊', '🤩'];

export default function WellnessPage() {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [mood, setMood] = useState(3);
  const [stress, setStress] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [note, setNote] = useState('');
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [insights, setInsights] = useState(null);
  const [intervention, setIntervention] = useState(null);
  const [tab, setTab] = useState('checkin');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [histRes, insRes] = await Promise.all([
        api.get('/wellness/history?days=7'),
        api.get('/wellness/insights'),
      ]);
      setHistory(histRes.moodHistory || []);
      setInsights(insRes.insights || null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckIn = async () => {
    setCheckinLoading(true);
    try {
      const res = await api.post('/wellness/mood', { mood, stressLevel: stress, energyLevel: energy, note });
      if (res.stressDetected && res.intervention) {
        setIntervention(res.intervention);
      }
      setNote('');
      await loadData();
      setTab('history');
    } catch (err) {
      console.error(err);
    } finally {
      setCheckinLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-white flex items-center gap-3">
        <FaHeart className="text-red-400" /> {t('Wellness Hub')}
      </h1>

      <div className="flex gap-2 border-b border-white/10 pb-2">
        {[['checkin', t('Daily Check-in')], ['history', t('History')], ['insights', t('Insights')]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === key ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'checkin' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4">{t('How are you feeling?')}</h2>
            <div className="flex justify-center gap-4 mb-6">
              {[1, 2, 3, 4, 5].map(m => (
                <button key={m} onClick={() => setMood(m)}
                  className={`text-4xl transition transform hover:scale-110 ${mood === m ? 'scale-125 ring-2 ring-purple-500 rounded-full' : 'opacity-50'}`}>
                  {moodEmojis[m]}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">{t('Stress Level')} (1-5)</label>
                <input type="range" min="1" max="5" value={stress} onChange={e => setStress(+e.target.value)} className="w-full accent-purple-500" />
                <div className="flex justify-between text-xs text-gray-500 mt-1"><span>{t('Low')}</span><span>{t('High')}</span></div>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">{t('Energy Level')} (1-5)</label>
                <input type="range" min="1" max="5" value={energy} onChange={e => setEnergy(+e.target.value)} className="w-full accent-green-500" />
                <div className="flex justify-between text-xs text-gray-500 mt-1"><span>{t('Low')}</span><span>{t('High')}</span></div>
              </div>
            </div>

            <textarea value={note} onChange={e => setNote(e.target.value)}
              placeholder={t('Add a note about your day (optional)...')}
              className="mt-4 w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 resize-none h-20" />

            <button onClick={handleCheckIn} disabled={checkinLoading}
              className="mt-4 w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50">
              {checkinLoading ? t('Saving...') : t('Save Check-in')}
            </button>
          </div>

          {intervention && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <FaLightbulb className="text-yellow-400 text-xl" />
                <h3 className="text-lg font-semibold text-white">{intervention.title}</h3>
              </div>
              <p className="text-gray-300">{intervention.content}</p>
              <button onClick={() => setIntervention(null)} className="mt-3 text-sm text-blue-400 hover:text-blue-300">{t('Dismiss')}</button>
            </motion.div>
          )}
        </motion.div>
      )}

      {tab === 'history' && (
        <div className="space-y-3">
          {history.length === 0 ? (
            <p className="text-gray-400 text-center py-8">{t('No check-ins yet. Start your first one!')}</p>
          ) : (
            history.reverse().map((h, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center gap-4">
                <span className="text-3xl">{moodEmojis[h.mood]}</span>
                <div className="flex-1">
                  <p className="text-white text-sm">{new Date(h.timestamp).toLocaleString()}</p>
                  {h.note && <p className="text-gray-400 text-xs mt-1">{h.note}</p>}
                </div>
                <div className="text-right text-xs text-gray-500">
                  <p>{t('Stress')}: {h.stressLevel}/5</p>
                  <p>{t('Energy')}: {h.energyLevel}/5</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'insights' && insights && (
        <div className="grid grid-cols-2 gap-4">
          {[
            [FaChartLine, t('Weekly Average'), `${insights.weeklyAverage}/5`, 'purple'],
            [FaFire, t('Streak'), `${insights.streak} ${t('days')}`, 'orange'],
            [FaHeart, t('Total Check-ins'), insights.totalCheckins, 'pink'],
            [FaBrain, t('Mood Trend'), insights.trend, 'blue'],
          ].map(([Icon, label, value, color], i) => (
            <div key={i} className="bg-white/5 rounded-xl p-5 border border-white/10 text-center">
              <Icon className={`text-${color}-400 text-2xl mx-auto mb-2`} />
              <p className="text-white font-bold text-xl">{value}</p>
              <p className="text-gray-400 text-sm">{label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
