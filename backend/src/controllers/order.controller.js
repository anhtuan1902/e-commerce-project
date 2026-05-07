const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const OrderVendor = require('../models/OrderVendor');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const Address = require('../models/Address');
const Payment = require('../models/Payment');
const sequelize = require('../database/sequelize');
const { successResponse, errorResponse } = require('../utils/response.util');
const { validateBody, validateQuery } = require('../middlewares/validation.middleware');
const { createOrderSchema, orderListQuerySchema } = require('../validations');

// ─────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────

const generateOrderNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp}-${random}`;
};

const addressInclude = (alias, attrs = null) => ({
  model: Address,
  as: alias,
  ...(attrs ? { attributes: attrs } : {}),
});

const FULL_ORDER_INCLUDE = [
  addressInclude('shippingAddress'),
  {
    model: OrderVendor,
    as: 'orderVendors',
    include: [
      {
        model: OrderItem,
        as: 'orderItems',
        include: [
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'slug', 'price'],
          },
        ],
      },
    ],
  },
];

// ─────────────────────────────────────────────────────
// LẤY DANH SÁCH ĐƠN HÀNG — GET /api/orders
// ─────────────────────────────────────────────────────
const getOrders = [
  validateQuery(orderListQuerySchema),
  async (req, res) => {
    try {
      const { id: userId } = req.user;
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
          addressInclude('shippingAddress', ['id', 'address_line_1', 'city', 'postal_code', 'country']),
          addressInclude('billingAddress', ['id', 'address_line_1', 'city', 'postal_code', 'country']),
          {
            model: OrderVendor,
            as: 'orderVendors',
            include: [
              {
                model: OrderItem,
                as: 'orderItems',
                include: [
                  {
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'name', 'slug', 'price'],
                    include: [
                      {
                        model: require('../models/ProductImage'),
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
    const { id: userId } = req.user;

    const order = await Order.findOne({
      where: { id, user_id: userId },
      include: [
        addressInclude('shippingAddress'),
        {
          model: OrderVendor,
          as: 'orderVendors',
          include: [
            {
              model: OrderItem,
              as: 'orderItems',
              include: [
                {
                  model: Product,
                  as: 'product',
                  include: [
                    { model: require('../models/ProductImage'), as: 'images', attributes: ['id', 'url', 'alt_text', 'is_primary'] },
                    { model: require('../models/Vendor'), as: 'vendor', attributes: ['id', 'store_name'] },
                  ],
                },
              ],
            },
          ],
        },
        { model: Payment, as: 'payments', attributes: ['id', 'amount', 'status', 'payment_method', 'createdAt'] },
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
      const { id: userId } = req.user;
      const { shipping_address_id, order_items, notes, customer_notes } = req.body;

      if (!order_items?.length) {
        return errorResponse(res, 'Đơn hàng phải có ít nhất một sản phẩm', 400);
      }

      // Validate addresses
      const shippingAddress = await Address.findOne({ where: { id: shipping_address_id, user_id: userId } });
      if (!shippingAddress) return errorResponse(res, 'Địa chỉ giao hàng không hợp lệ', 400);

      // Validate products & group by vendor
      const validationResult = await validateAndGroupProducts(order_items);
      if (validationResult.error) {
        return errorResponse(res, validationResult.error, 400);
      }

      // Create order with transaction
      const order = await createOrderTransaction({
        userId,
        shipping_address_id,
        notes,
        customer_notes,
        vendorGroups: validationResult.vendorGroups,
      });

      const fullOrder = await Order.findByPk(order.id, { include: FULL_ORDER_INCLUDE });

      return successResponse(res, fullOrder, 'Tạo đơn hàng thành công', 201);
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        return errorResponse(res, 'Dữ liệu không hợp lệ', 422, error.errors.map((e) => e.message));
      }
      console.error('Create order error:', error);
      return errorResponse(res, 'Lỗi server');
    }
  },
];

// ─────────────────────────────────────────────────────
// VALIDATE & GROUP PRODUCTS BY VENDOR
// ─────────────────────────────────────────────────────
const validateAndGroupProducts = async (order_items) => {
  const vendorGroups = {};
  let totalSubtotal = 0;

  for (const item of order_items) {
    const product = await Product.findByPk(item.product_id, {
      include: [
        { model: Inventory, as: 'inventory' },
        { model: require('../models/Vendor'), as: 'vendor' },
      ],
    });

    if (!product) {
      return { error: `Sản phẩm ${item.product_id} không tồn tại` };
    }
    if (product.status !== 'active') {
      return { error: `Sản phẩm "${product.name}" không khả dụng` };
    }

    const inventory = product.inventory;
    if (inventory?.track_inventory && inventory.quantity < item.quantity) {
      return { error: `Sản phẩm "${product.name}" chỉ còn ${inventory.quantity} sản phẩm` };
    }

    const itemTotal = parseFloat(product.price) * item.quantity;
    totalSubtotal += itemTotal;

    // Group by vendor_id (use default vendor if product has no vendor)
    const vendorId = product.vendor_id || 0;
    if (!vendorGroups[vendorId]) {
      vendorGroups[vendorId] = {
        vendorId,
        vendorName: product.vendor?.store_name || 'Default',
        items: [],
        subtotal: 0,
        inventoryUpdates: [],
      };
    }

    vendorGroups[vendorId].items.push({
      product_id: item.product_id,
      product_name: product.name,
      product_sku: product.sku,
      quantity: item.quantity,
      unit_price: product.price,
      total_price: itemTotal,
    });

    vendorGroups[vendorId].subtotal += itemTotal;

    if (inventory?.track_inventory) {
      vendorGroups[vendorId].inventoryUpdates.push({
        product_id: item.product_id,
        quantity: item.quantity,
        currentQty: inventory.quantity,
      });
    }
  }

  return { vendorGroups, totalSubtotal };
};

// ─────────────────────────────────────────────────────
// CREATE ORDER TRANSACTION
// ─────────────────────────────────────────────────────
const createOrderTransaction = async ({
  userId,
  shipping_address_id,
  notes,
  customer_notes,
  vendorGroups,
}) => {
  return sequelize.transaction(async (t) => {
    // Calculate totals
    const subtotal = Object.values(vendorGroups).reduce((sum, v) => sum + v.subtotal, 0);

    // Create order
    const order = await Order.create(
      {
        order_number: generateOrderNumber(),
        user_id: userId,
        shipping_address_id,
        subtotal,
        tax_amount: 0,
        shipping_amount: 0,
        discount_amount: 0,
        total_amount: subtotal,
        notes,
        customer_notes,
      },
      { transaction: t },
    );

    // Process each vendor group
    const allPromises = [];

    for (const vendorGroup of Object.values(vendorGroups)) {
      // Create OrderVendor
      const orderVendor = await OrderVendor.create(
        {
          order_id: order.id,
          vendor_id: vendorGroup.vendorId || null,
          subtotal: vendorGroup.subtotal,
          tax_amount: 0,
          shipping_amount: 0,
          discount_amount: 0,
          total_amount: vendorGroup.subtotal,
        },
        { transaction: t },
      );

      // Create OrderItems for this vendor
      const itemPromises = vendorGroup.items.map((item) =>
        OrderItem.create(
          {
            order_id: order.id,
            order_vendor_id: orderVendor.id,
            ...item,
          },
          { transaction: t },
        ),
      );
      allPromises.push(...itemPromises);

      // Update sold_count
      for (const item of vendorGroup.items) {
        allPromises.push(
          Product.increment('sold_count', { by: item.quantity, where: { id: item.product_id } }, { transaction: t }),
        );
      }

      // Update inventory (with negative check)
      for (const inv of vendorGroup.inventoryUpdates) {
        const newQty = inv.currentQty - inv.quantity;
        if (newQty < 0) {
          throw new Error(`Sản phẩm ${inv.product_id} không đủ tồn kho`);
        }
        allPromises.push(
          Inventory.decrement('quantity', { by: inv.quantity, where: { product_id: inv.product_id } }, { transaction: t }),
        );
      }
    }

    await Promise.all(allPromises);

    return order;
  });
};

// ─────────────────────────────────────────────────────
// HỦY ĐƠN HÀNG — PUT /api/orders/:id/cancel
// ─────────────────────────────────────────────────────
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId } = req.user;

    const order = await Order.findOne({ where: { id, user_id: userId } });

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
