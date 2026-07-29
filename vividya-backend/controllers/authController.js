import jwt from 'jsonwebtoken';
import * as userService from '../services/userService.js';
import UserSession from '../models/UserSession.js';
import { UnauthorizedError, BadRequestError } from '../utils/error-handler.js';

const generateTokens = (userId, email) => {
  const accessToken = jwt.sign(
    { sub: userId, email, role: 'user', aud: 'vividya-app' },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' }
  );

  const refreshToken = jwt.sign(
    { sub: userId, type: 'refresh', sessionId: Date.now().toString() },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
  );

  return { accessToken, refreshToken };
};

export const signup = async (req, res, next) => {
  try {
    const { email, password, fullName, branch, year, college, preferredLanguage } = req.body;

    const user = await userService.createUser({
      email,
      passwordHash: password,
      authProvider: 'email',
      profile: { fullName, branch, year, college, preferredLanguage: preferredLanguage || 'en' },
      subscription: { plan: 'free', startDate: new Date(), chatMessagesUsed: 0, noteSummariesUsed: 0 },
    });

    const { accessToken, refreshToken } = generateTokens(user._id, user.email);

    await UserSession.create({
      userId: user._id,
      refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        userId: user._id,
        email: user.email,
        accessToken,
        refreshToken,
        expiresIn: 900,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await userService.findUserByEmail(email);
    if (!user) throw new UnauthorizedError('Invalid email or password');

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new UnauthorizedError('Invalid email or password');

    if (!user.isActive) throw new UnauthorizedError('Account is deactivated');

    const { accessToken, refreshToken } = generateTokens(user._id, user.email);

    await UserSession.create({
      userId: user._id,
      refreshToken,
      deviceInfo: {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
      },
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.json({
      success: true,
      data: {
        userId: user._id,
        email: user.email,
        accessToken,
        refreshToken,
        expiresIn: 900,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) throw new BadRequestError('Refresh token required');

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    if (decoded.type !== 'refresh') throw new UnauthorizedError('Invalid token type');

    const session = await UserSession.findOne({
      userId: decoded.sub,
      refreshToken: token,
      isActive: true,
    });

    if (!session) throw new UnauthorizedError('Session not found or revoked');

    const user = await userService.findUserById(decoded.sub);
    const newAccessToken = jwt.sign(
      { sub: user._id, email: user.email, role: 'user', aud: 'vividya-app' },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' }
    );

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        expiresIn: 900,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    await UserSession.updateMany(
      { userId: req.user.sub, isActive: true },
      { isActive: false }
    );

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};
