const express = require('express');
const router = express.Router();

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/product.controller');

const { authenticate } = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');

/**
 * @openapi
 * /api/products:
 *   get:
 *     summary: Lấy danh sách sản phẩm
 *     tags:
 *       - Products
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: vendor_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, active, inactive, archived]
 *           default: active
 *       - in: query
 *         name: visibility
 *         schema:
 *           type: string
 *           enum: [public, private, hidden]
 *           default: public
 *       - in: query
 *         name: min_price
 *         schema:
 *           type: number
 *       - in: query
 *         name: max_price
 *         schema:
 *           type: number
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [createdAt, name, price, updatedAt]
 *           default: createdAt
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *     responses:
 *       200:
 *         description: Danh sách sản phẩm
 */
router.get('/', getProducts);

/**
 * @openapi
 * /api/products/{id}:
 *   get:
 *     summary: Lấy chi tiết sản phẩm
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Chi tiết sản phẩm
 *       404:
 *         description: Sản phẩm không tồn tại
 */
router.get('/:id', getProductById);

// Các routes sau cần authentication
router.use(authenticate);

/**
 * @openapi
 * /api/products:
 *   post:
 *     summary: Tạo sản phẩm mới (Vendor only)
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category_id
 *               - name
 *               - price
 *             properties:
 *               category_id:
 *                 type: integer
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               short_description:
 *                 type: string
 *               sku:
 *                 type: string
 *               price:
 *                 type: number
 *               compare_price:
 *                 type: number
 *               cost_price:
 *                 type: number
 *               weight:
 *                 type: number
 *               dimensions:
 *                 type: object
 *                 properties:
 *                   length:
 *                     type: number
 *                   width:
 *                     type: number
 *                   height:
 *                     type: number
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               attributes:
 *                 type: object
 *               status:
 *                 type: string
 *                 enum: [draft, active, inactive, archived]
 *                 default: draft
 *               visibility:
 *                 type: string
 *                 enum: [public, private, hidden]
 *                 default: public
 *               allow_backorders:
 *                 type: boolean
 *                 default: false
 *               sold_individually:
 *                 type: boolean
 *                 default: false
 *               featured:
 *                 type: boolean
 *                 default: false
 *               seo_title:
 *                 type: string
 *               seo_description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Sản phẩm đã được tạo
 */
router.post('/', requireRole('vendor'), createProduct);

/**
 * @openapi
 * /api/products/{id}:
 *   put:
 *     summary: Cập nhật sản phẩm (Vendor only)
 *     tags:
 *       - Products
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
 *               category_id:
 *                 type: integer
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               short_description:
 *                 type: string
 *               sku:
 *                 type: string
 *               price:
 *                 type: number
 *               compare_price:
 *                 type: number
 *               cost_price:
 *                 type: number
 *               weight:
 *                 type: number
 *               dimensions:
 *                 type: object
 *               tags:
 *                 type: array
 *               attributes:
 *                 type: object
 *               status:
 *                 type: string
 *               visibility:
 *                 type: string
 *               allow_backorders:
 *                 type: boolean
 *               sold_individually:
 *                 type: boolean
 *               featured:
 *                 type: boolean
 *               seo_title:
 *                 type: string
 *               seo_description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sản phẩm đã được cập nhật
 */
router.put('/:id', requireRole('vendor'), updateProduct);

/**
 * @openapi
 * /api/products/{id}:
 *   delete:
 *     summary: Xóa sản phẩm (Vendor only)
 *     tags:
 *       - Products
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
 *         description: Sản phẩm đã được xóa
 */
router.delete('/:id', requireRole('vendor'), deleteProduct);

module.exports = router;
