const express = require('express');
const passport = require('passport');

const publicRouter = express.Router();
const protectedRouter = express.Router();

const {
  register,
  login,
  googleCallback,
  refreshToken,
  logout,
  logoutAll,
  getSessions,
  getMe,
} = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { loginRateLimit } = require('../middlewares/rateLimit.middleware');

// Đăng ký / đăng nhập thường
/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Đăng ký tài khoản mới
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum:
 *                   - customer
 *                   - vendor
 *                 default: customer
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 100
 *                 required: true
 *                 format: password
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Avatar của user
 *               phone:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 15
 *                 format: phone
 *               address:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 100
 *                 format: address
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
publicRouter.post('/register', register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Đăng nhập tài khoản
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *       401:
 *         description: Email hoặc mật khẩu không đúng
 */
publicRouter.post('/login', loginRateLimit, login);

/**
 * @openapi
 * /api/auth/refresh-token:
 *   post:
 *     summary: Làm mới token
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Làm mới token thành công
 *       401:
 *         description: Refresh token không hợp lệ
 */
publicRouter.post('/refresh-token', refreshToken);

// Bước 1: Redirect sang Google
/**
 * @openapi
 * /api/auth/google:
 *   get:
 *     summary: Redirect sang Google
 *     tags:
 *       - Auth
 *     responses:
 *       302:
 *         description: Redirect sang Google
 *       401:
 *         description: Chưa xác thực
 */
publicRouter.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  }),
);

// Bước 2: Google redirect về đây sau khi user đồng ý
/**
 * @openapi
 * /api/auth/google/callback:
 *   get:
 *     summary: Google redirect về đây sau khi user đồng ý
 *     tags:
 *       - Auth
 *     responses:
 *       302:
 *         description: Google redirect về đây sau khi user đồng ý
 */
publicRouter.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/api/auth/google/error',
  }),
  googleCallback,
);

// Protected
protectedRouter.use(authenticate);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Đăng xuất
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 required: true
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Đăng xuất thành công
 *       401:
 *         description: Chưa xác thực
 */
protectedRouter.post('/logout', logout);

/**
 * @openapi
 * /api/auth/logout-all:
 *   post:
 *     summary: Đăng xuất khỏi tất cả thiết bị
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Đăng xuất khỏi tất cả thiết bị thành công
 *       401:
 *         description: Chưa xác thực
 */
protectedRouter.post('/logout-all', logoutAll);

/**
 * @openapi
 * /api/auth/sessions:
 *   get:
 *     summary: Xem các phiên đăng nhập hiện tại
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Lấy danh sách phiên đăng nhập thành công
 *       401:
 *         description: Chưa xác thực
 */
protectedRouter.get('/sessions', getSessions);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Lấy thông tin user
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Lấy thông tin user thành công
 *       401:
 *         description: Chưa xác thực
 */
protectedRouter.get('/me', getMe);

module.exports = {
  publicRouter,
  protectedRouter,
};
