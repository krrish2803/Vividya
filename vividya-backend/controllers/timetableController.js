import * as timetableService from '../services/timetableService.js';
import { BadRequestError } from '../utils/error-handler.js';

export const createTask = async (req, res, next) => {
  try {
    const task = await timetableService.createTask(req.user.sub, req.body);
    res.json({ success: true, task });
  } catch (err) { next(err); }
};

export const getTasks = async (req, res, next) => {
  try {
    const { status } = req.query;
    const tasks = await timetableService.getTasks(req.user.sub, status);
    res.json({ success: true, tasks });
  } catch (err) { next(err); }
};

export const completeTask = async (req, res, next) => {
  try {
    const task = await timetableService.completeTask(req.user.sub, req.params.taskId);
    res.json({ success: true, task });
  } catch (err) { next(err); }
};

export const deleteTask = async (req, res, next) => {
  try {
    await timetableService.deleteTask(req.user.sub, req.params.taskId);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { next(err); }
};

export const generateStudyPlan = async (req, res, next) => {
  try {
    const { duration = 'weekly', topic } = req.body;
    const plan = await timetableService.generateStudyPlan(req.user.sub, duration, topic);
    res.json({ success: true, plan });
  } catch (err) { next(err); }
};

export const getCurrentPlan = async (req, res, next) => {
  try {
    const plan = await timetableService.getCurrentPlan(req.user.sub);
    res.json({ success: true, plan });
  } catch (err) { next(err); }
};

export const logPomodoro = async (req, res, next) => {
  try {
    const { taskId, minutes = 25 } = req.body;
    if (!taskId) throw new BadRequestError('taskId required');
    const task = await timetableService.logPomodoro(req.user.sub, taskId, minutes);
    res.json({ success: true, task });
  } catch (err) { next(err); }
};

export const autoAdjustPlan = async (req, res, next) => {
  try {
    const adjustments = await timetableService.autoAdjustPlan(req.user.sub);
    res.json({ success: true, adjustments });
  } catch (err) { next(err); }
};
