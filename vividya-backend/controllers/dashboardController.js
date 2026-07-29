import * as dashboardService from '../services/dashboardService.js';

export const getStats = async (req, res, next) => {
  try {
    const stats = await dashboardService.getDashboardStats(req.user.sub);
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

export const getDailyGreeting = async (req, res, next) => {
  try {
    const greeting = await dashboardService.getDailyGreeting(req.user.sub);
    res.json({ success: true, data: greeting });
  } catch (error) {
    next(error);
  }
};

export const getHealthScore = async (req, res, next) => {
  try {
    const health = await dashboardService.getStudentHealthScore(req.user.sub);
    res.json({ success: true, data: health });
  } catch (error) {
    next(error);
  }
};

export const getActivityFeed = async (req, res, next) => {
  try {
    const feed = await dashboardService.getActivityFeed(req.user.sub);
    res.json({ success: true, data: feed });
  } catch (error) {
    next(error);
  }
};
