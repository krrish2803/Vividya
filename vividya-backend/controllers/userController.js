import * as userService from '../services/userService.js';

export const getProfile = async (req, res, next) => {
  try {
    const user = await userService.findUserById(req.user.sub);
    res.json({ success: true, data: user.toPublic() });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const user = await userService.updateProfile(req.user.sub, req.body.profile);
    res.json({ success: true, message: 'Profile updated', data: user });
  } catch (error) {
    next(error);
  }
};

export const moodCheck = async (req, res, next) => {
  try {
    const { mood, note } = req.body;
    const wellness = await userService.addMoodEntry(req.user.sub, mood, note);
    res.status(201).json({
      success: true,
      message: 'Mood recorded',
      data: { mood, note, timestamp: new Date(), wellness },
    });
  } catch (error) {
    next(error);
  }
};
