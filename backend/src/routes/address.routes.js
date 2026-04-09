const express = require('express');
const router = express.Router();

const {
  getAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} = require('../controllers/address.controller');

const { authenticate } = require('../middlewares/auth.middleware');

// Tất cả routes đều cần authentication
router.use(authenticate);

/**
 * @openapi
 * /api/addresses:
 *   get:
 *     summary: Lấy danh sách địa chỉ của user
 *     tags:
 *       - Addresses
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách địa chỉ
 */
router.get('/', getAddresses);

/**
 * @openapi
 * /api/addresses:
 *   post:
 *     summary: Tạo địa chỉ mới
 *     tags:
 *       - Addresses
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               address_detail:
 *                 type: string
 *               district:
 *                 type: string
 *               city:
 *                 type: string
 *               ward:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [home, work]
 *               is_default:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Địa chỉ đã được tạo
 */
router.post('/', createAddress);

/**
 * @openapi
 * /api/addresses/{id}:
 *   get:
 *     summary: Lấy chi tiết địa chỉ
 *     tags:
 *       - Addresses
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Chi tiết địa chỉ
 *       404:
 *         description: Địa chỉ không tồn tại
 */
router.get('/:id', getAddressById);

/**
 * @openapi
 * /api/addresses/{id}:
 *   put:
 *     summary: Cập nhật địa chỉ
 *     tags:
 *       - Addresses
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               address_detail:
 *                 type: string
 *               district:
 *                 type: string
 *               city:
 *                 type: string
 *               ward:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [home, work]
 *               is_default:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Địa chỉ đã được cập nhật
 */
router.put('/:id', updateAddress);

/**
 * @openapi
 * /api/addresses/{id}:
 *   delete:
 *     summary: Xóa địa chỉ
 *     tags:
 *       - Addresses
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Địa chỉ đã được xóa
 */
router.delete('/:id', deleteAddress);

/**
 * @openapi
 * /api/addresses/{id}/set-default:
 *   put:
 *     summary: Đặt địa chỉ mặc định
 *     tags:
 *       - Addresses
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Địa chỉ mặc định đã được cập nhật
 */
router.put('/:id/set-default', setDefaultAddress);

module.exports = router;
