import * as wellnessService from '../services/wellnessService.js';
import { NotFoundError } from '../utils/error-handler.js';

export const moodCheckIn = async (req, res, next) => {
  try {
    const { mood, stressLevel, energyLevel, note } = req.body;
    const result = await wellnessService.performMoodCheckIn(req.user.sub, mood, stressLevel, energyLevel, note);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

export const getWellnessHistory = async (req, res, next) => {
  try {
    const { days = 7 } = req.query;
    const result = await wellnessService.getWellnessHistory(req.user.sub, parseInt(days));
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

export const getWellnessInsights = async (req, res, next) => {
  try {
    const insights = await wellnessService.getWellnessInsights(req.user.sub);
    res.json({ success: true, insights });
  } catch (err) { next(err); }
};

export const respondToIntervention = async (req, res, next) => {
  try {
    const { interventionId, response, feedback } = req.body;
    const intervention = await wellnessService.respondToIntervention(interventionId, response, feedback);
    res.json({ success: true, intervention });
  } catch (err) { next(err); }
};

export const getTodayCheckInStatus = async (req, res, next) => {
  try {
    const result = await wellnessService.getTodayCheckInStatus(req.user.sub);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

export const getDailyNudge = async (req, res, next) => {
  try {
    const nudge = await wellnessService.getDailyNudge(req.user.sub);
    res.json({ success: true, nudge });
  } catch (err) { next(err); }
};

export const getMoodChartData = async (req, res, next) => {
  try {
    const data = await wellnessService.getMoodChartData(req.user.sub);
    res.json({ success: true, ...data });
  } catch (err) { next(err); }
};
