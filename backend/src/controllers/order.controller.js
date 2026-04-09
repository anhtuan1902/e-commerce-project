const Order = require('../models/Order');
const { successResponse, errorResponse } = require('../utils/response.util');
const { validateBody, validateQuery } = require('../middlewares/validation.middleware');
const { createOrderSchema, orderListQuerySchema } = require('../validations');

// ─────────────────────────────────────────────────────
// LẤY DANH SÁCH ĐƠN HÀNG CỦA USER — GET /api/orders
// ─────────────────────────────────────────────────────
const getOrders = [
  validateQuery(orderListQuerySchema),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10, status } = req.query;
      const offset = (page - 1) * limit;

      const where = { user_id: userId };
      if (status) where.status = status;

      const { count, rows: orders } = await Order.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['ordered_at', 'DESC']],
        include: [
          {
            model: require('../models.Address'),
            as: 'shippingAddress',
            attributes: ['id', 'address_line_1', 'city', 'postal_code', 'country'],
          },
          {
            model: require('../models.Address'),
            as: 'billingAddress',
            attributes: ['id', 'address_line_1', 'city', 'postal_code', 'country'],
          },
          {
            model: require('../models.OrderItem'),
            as: 'orderItems',
            include: [
              {
                model: require('../models/Product'),
                as: 'product',
                attributes: ['id', 'name', 'slug', 'price'],
                include: [
                  {
                    model: require('../models.ProductImage'),
                    as: 'images',
                    where: { is_primary: true },
                    required: false,
                    attributes: ['url'],
                  },
                ],
              },
            ],
          },
        ],
      });

      return successResponse(res, {
        orders,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit),
        },
      });
    } catch (error) {
      console.error('Get orders error:', error);
      return errorResponse(res, 'Lỗi server');
    }
  },
];

// ─────────────────────────────────────────────────────
// LẤY CHI TIẾT ĐƠN HÀNG — GET /api/orders/:id
// ─────────────────────────────────────────────────────
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({
      where: { id, user_id: userId },
      include: [
        {
          model: require('../models.Address'),
          as: 'shippingAddress',
        },
        {
          model: require('../models.Address'),
          as: 'billingAddress',
        },
        {
          model: require('../models.OrderItem'),
          as: 'orderItems',
          include: [
            {
              model: require('../models.Product'),
              as: 'product',
              include: [
                {
                  model: require('../models.ProductImage'),
                  as: 'images',
                  attributes: ['id', 'url', 'alt_text', 'is_primary'],
                },
                {
                  model: require('../models.Vendor'),
                  as: 'vendor',
                  attributes: ['id', 'name'],
                },
              ],
            },
          ],
        },
        {
          model: require('../models.Payment'),
          as: 'payments',
          attributes: ['id', 'amount', 'status', 'payment_method', 'createdAt'],
        },
      ],
    });

    if (!order) return errorResponse(res, 'Không tìm thấy đơn hàng', 404);

    return successResponse(res, order);
  } catch (error) {
    console.error('Get order by id error:', error);
    return errorResponse(res, 'Lỗi server');
  }
};

// ─────────────────────────────────────────────────────
// TẠO ĐƠN HÀNG MỚI — POST /api/orders
// ─────────────────────────────────────────────────────
const createOrder = [
  validateBody(createOrderSchema),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { shipping_address_id, billing_address_id, order_items, notes, customer_notes } =
        req.body;

      if (!order_items || !Array.isArray(order_items) || order_items.length === 0) {
        return errorResponse(res, 'Đơn hàng phải có ít nhất một sản phẩm', 400);
      }

      // Kiểm tra địa chỉ
      const shippingAddress = await require('../models/Address').findOne({
        where: { id: shipping_address_id, user_id: userId },
      });
      if (!shippingAddress) return errorResponse(res, 'Địa chỉ giao hàng không hợp lệ', 400);

      let billingAddress = null;
      if (billing_address_id) {
        billingAddress = await require('../models/Address').findOne({
          where: { id: billing_address_id, user_id: userId },
        });
        if (!billingAddress) return errorResponse(res, 'Địa chỉ thanh toán không hợp lệ', 400);
      }

      // Tính tổng tiền và kiểm tra sản phẩm
      let subtotal = 0;
      const OrderItem = require('../models/OrderItem');
      const validOrderItems = [];

      for (const item of order_items) {
        const product = await require('../models/Product').findByPk(item.product_id, {
          include: [
            {
              model: require('../models.Inventory'),
              as: 'inventory',
            },
          ],
        });

        if (!product) return errorResponse(res, `Sản phẩm ${item.product_id} không tồn tại`, 400);
        if (product.status !== 'active')
          return errorResponse(res, `Sản phẩm ${product.name} không khả dụng`, 400);

        // Kiểm tra tồn kho
        const inventory = product.inventory;
        if (inventory && inventory.track_inventory && inventory.quantity < item.quantity) {
          return errorResponse(
            res,
            `Sản phẩm ${product.name} chỉ còn ${inventory.quantity} sản phẩm`,
            400,
          );
        }

        const itemTotal = parseFloat(product.price) * item.quantity;
        subtotal += itemTotal;

        validOrderItems.push({
          product_id: item.product_id,
          quantity: item.quantity,
          price: product.price,
          total: itemTotal,
        });
      }

      // Tạo đơn hàng
      const order = await Order.create({
        user_id: userId,
        shipping_address_id,
        billing_address_id,
        subtotal,
        tax_amount: 0, // Có thể tính thuế sau
        shipping_amount: 0, // Có thể tính phí ship sau
        discount_amount: 0, // Có thể áp dụng discount sau
        total_amount: subtotal,
        notes,
        customer_notes,
      });

      // Tạo order items
      for (const item of validOrderItems) {
        await OrderItem.create({
          order_id: order.id,
          ...item,
        });
      }

      // Trả về đơn hàng với đầy đủ thông tin
      const fullOrder = await Order.findByPk(order.id, {
        include: [
          {
            model: require('../models.Address'),
            as: 'shippingAddress',
          },
          {
            model: require('../models.OrderItem'),
            as: 'orderItems',
            include: [
              {
                model: require('../models/Product'),
                as: 'product',
                attributes: ['id', 'name', 'price'],
              },
            ],
          },
        ],
      });

      return successResponse(res, fullOrder, 'Tạo đơn hàng thành công', 201);
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        return errorResponse(
          res,
          'Dữ liệu không hợp lệ',
          422,
          error.errors.map((e) => e.message),
        );
      }
      console.error('Create order error:', error);
      return errorResponse(res, 'Lỗi server');
    }
  },
];

// ─────────────────────────────────────────────────────
// HỦY ĐƠN HÀNG — PUT /api/orders/:id/cancel
// ─────────────────────────────────────────────────────
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({
      where: { id, user_id: userId },
    });

    if (!order) return errorResponse(res, 'Không tìm thấy đơn hàng', 404);
    if (!order.canCancel()) return errorResponse(res, 'Không thể hủy đơn hàng này', 400);

    await order.updateStatus('cancelled', 'Hủy bởi khách hàng');

    return successResponse(res, order, 'Hủy đơn hàng thành công');
  } catch (error) {
    console.error('Cancel order error:', error);
    return errorResponse(res, 'Lỗi server');
  }
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  cancelOrder,
};
