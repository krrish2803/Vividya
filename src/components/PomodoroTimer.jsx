import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaPause, FaRedo, FaCheck, FaCoffee, FaVolumeUp } from 'react-icons/fa';

const WORK_MINUTES = 25;
const BREAK_MINUTES = 5;
const LONG_BREAK_MINUTES = 15;
const CYCLES_BEFORE_LONG_BREAK = 4;

export default function PomodoroTimer({ task, onComplete }) {
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [timeLeft, setTimeLeft] = useState(WORK_MINUTES * 60);
  const [cycle, setCycle] = useState(0);
  const [totalPomodoros, setTotalPomodoros] = useState(task?.pomodoros?.completed || 0);
  const [sessionMinutes, setSessionMinutes] = useState(0);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  const totalTime = isBreak
    ? (cycle % CYCLES_BEFORE_LONG_BREAK === 0 && cycle > 0 ? LONG_BREAK_MINUTES : BREAK_MINUTES) * 60
    : WORK_MINUTES * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
        setSessionMinutes(prev => prev + 1 / 60);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSessionEnd();
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft]);

  const playNotification = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = isBreak ? 523.25 : 659.25;
      gain.gain.value = 0.3;
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {}
  }, [isBreak]);

  const handleSessionEnd = async () => {
    setIsRunning(false);
    playNotification();

    if (!isBreak) {
      const newCount = totalPomodoros + 1;
      setTotalPomodoros(newCount);
      try {
        await api.post('/timetable/pomodoro', { taskId: task._id, minutes: WORK_MINUTES });
      } catch (e) {}

      const nextIsLongBreak = newCount % CYCLES_BEFORE_LONG_BREAK === 0;
      const breakMins = nextIsLongBreak ? LONG_BREAK_MINUTES : BREAK_MINUTES;
      setCycle(prev => prev + 1);
      setIsBreak(true);
      setTimeLeft(breakMins * 60);
    } else {
      setIsBreak(false);
      setTimeLeft(WORK_MINUTES * 60);
    }
  };

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(WORK_MINUTES * 60);
    setSessionMinutes(0);
  };

  const skipSession = () => {
    setIsRunning(false);
    handleSessionEnd();
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const ringColor = isBreak
    ? 'stroke-emerald-400'
    : progress < 50 ? 'stroke-sarthiPurple' : progress < 80 ? 'stroke-sarthiGold' : 'stroke-sarthiPink';

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Timer Label */}
      <div className="flex items-center gap-2">
        {isBreak ? (
          <FaCoffee className="text-emerald-400" />
        ) : (
          <FaPlay className="text-sarthiPurple" />
        )}
        <span className="text-sm font-medium text-white">
          {isBreak ? 'Break Time' : 'Focus Session'}
        </span>
        <span className="text-xs text-sarthiMuted">
          ({totalPomodoros} completed)
        </span>
      </div>

      {/* Circular Timer */}
      <div className="relative w-48 h-48">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <circle
            cx="100" cy="100" r="90" fill="none"
            className={ringColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-mono font-bold text-white">{formatTime(timeLeft)}</span>
          <span className="text-xs text-sarthiMuted mt-1">
            Cycle {Math.floor(cycle / CYCLES_BEFORE_LONG_BREAK) + 1} · Session {(cycle % CYCLES_BEFORE_LONG_BREAK) + 1}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button onClick={resetTimer}
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-sarthiMuted hover:text-white hover:border-sarthiPurple/50 transition">
          <FaRedo className="w-4 h-4" />
        </button>
        <button onClick={toggleTimer}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold transition-all shadow-lg ${
            isRunning
              ? 'bg-sarthiPink hover:bg-sarthiPink/80 shadow-sarthiPink/30'
              : 'bg-sarthiPurple hover:bg-sarthiPrimary shadow-sarthiPurple/30'
          }`}>
          {isRunning ? <FaPause className="w-5 h-5" /> : <FaPlay className="w-5 h-5 ml-0.5" />}
        </button>
        <button onClick={skipSession}
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-sarthiMuted hover:text-white hover:border-sarthiPurple/50 transition">
          <FaCheck className="w-4 h-4" />
        </button>
      </div>

      {/* Task Info */}
      {task && (
        <div className="text-center mt-2">
          <p className="text-sm text-white font-medium">{task.title}</p>
          <p className="text-xs text-sarthiMuted">{task.subject} · {task.pomodoros?.completed || 0} pomodoros · {task.timeSpent || 0}min total</p>
        </div>
      )}

      {/* Pomodoro Indicators */}
      <div className="flex gap-1.5 mt-1">
        {Array.from({ length: CYCLES_BEFORE_LONG_BREAK }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all ${
              i < (totalPomodoros % CYCLES_BEFORE_LONG_BREAK)
                ? 'bg-sarthiPurple shadow-md shadow-sarthiPurple/50'
                : 'bg-white/10 border border-white/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
