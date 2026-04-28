const express = require('express');
const router = express.Router();

const { authenticate } = require('../middlewares/auth.middleware');
const {
  getVendors,
  getVendorById,
  updateVendor,
  deleteVendor,
} = require('../controllers/vendor.controller');
const upload = require('../middlewares/upload.middleware');

router.use(authenticate);

/**
 * @openapi
 * /api/vendors:
 *   get:
 *     summary: Lấy danh sách nhà cung cấp
 *     tags:
 *       - Vendors
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Trang hiện tại
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng nhà cung cấp trên mỗi trang
 *     responses:
 *       200:
 *         description: Danh sách nhà cung cấp
 */
router.get('/', getVendors);

/**
 * @openapi
 * /api/vendors/{id}:
 *   get:
 *     summary: Lấy chi tiết nhà cung cấp
 *     tags:
 *       - Vendors
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Chi tiết nhà cung cấp
 *       404:
 *         description: Nhà cung cấp không tồn tại
 */
router.get('/:id', getVendorById);

/**
 * @openapi
 * /api/vendors/{id}:
 *   put:
 *     summary: Cập nhật nhà cung cấp
 *     tags:
 *       - Vendors
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               store_name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *               logo_url:
 *                 type: string
 *                 format: binary
 *                 nullable: true
 *               contact_email:
 *                 type: string
 *                 format: email
 *                 maxLength: 255
 *               contact_phone:
 *                 type: string
 *                 maxLength: 20
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Nhà cung cấp đã được cập nhật
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       404:
 *         description: Nhà cung cấp không tồn tại
 */

router.put('/:id', updateVendor, upload.single('logo_url'));

/**
 * @openapi
 * /api/vendors/{id}:
 *   delete:
 *     summary: Xóa nhà cung cấp
 *     tags:
 *       - Vendors
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: false
 *     responses:
 *       200:
 *         description: Nhà cung cấp đã được xóa
 *       404:
 *         description: Nhà cung cấp không tồn tại
 */
router.delete('/:id', deleteVendor);

module.exports = router;
