const { z } = require('zod');

// ─────────────────────────────────────────────────────
// AUTH VALIDATION SCHEMAS
// ─────────────────────────────────────────────────────
const idParamSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, 'ID phải là số nguyên dương')
    .transform((val) => parseInt(val)),
});

const emptyToNull = (value) => {
  if (value === '' || value === undefined) return null;
  return value;
};

const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Tên phải có ít nhất 2 ký tự')
    .max(100, 'Tên không được vượt quá 100 ký tự')
    .trim(),

  email: z
    .string()
    .email('Email không hợp lệ')
    .max(150, 'Email không được vượt quá 150 ký tự')
    .toLowerCase()
    .trim(),

  password: z
    .string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .max(100, 'Mật khẩu không được vượt quá 100 ký tự')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số',
    ),

  role: z.enum(['customer', 'vendor']).optional(),

  phone: z.preprocess(
    emptyToNull,
    z
      .string()
      .regex(/^(\+84|84|0)(3|5|7|8|9)[0-9]{8}$/, 'Số điện thoại không hợp lệ')
      .nullable()
      .optional(),
  ),

  avatar: z.preprocess(emptyToNull, z.string().nullable().optional()),

  birthday: z.preprocess(emptyToNull, z.string().nullable().optional()),

  gender: z.enum(['male', 'female', 'other']).nullable().optional(),

  store_name: z
    .string()
    .min(2, 'Tên cửa hàng phải có ít nhất 2 ký tự')
    .max(100, 'Tên cửa hàng không được vượt quá 100 ký tự')
    .trim()
    .optional()
    .or(z.literal('').nullable()),
});

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ').toLowerCase().trim(),

  password: z.string().min(1, 'Mật khẩu không được để trống'),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token không được để trống'),
});

const logoutSchema = z.object({
  refreshToken: z.string().optional(),
});

const changePasswordSchema = z
  .object({
    password: z.string().optional(),
    new_password: z
      .string()
      .min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự.')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Mật khẩu mới phải bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.',
      ),
    confirm_password: z
      .string()
      .min(8, 'Xác nhận mật khẩu mới phải có ít nhất 8 ký tự.')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Xác nhận mật khẩu mới phải bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.',
      ),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

// ─────────────────────────────────────────────────────
// USER VALIDATION SCHEMAS
// ─────────────────────────────────────────────────────

const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Tên phải có ít nhất 2 ký tự')
    .max(100, 'Tên không được vượt quá 100 ký tự')
    .trim()
    .optional(),

  email: z
    .string()
    .email('Email không hợp lệ')
    .max(150, 'Email không được vượt quá 150 ký tự')
    .toLowerCase()
    .trim()
    .optional(),

  role: z
    .enum(['admin', 'vendor', 'customer'], {
      errorMap: () => ({ message: 'Role phải là admin, vendor hoặc customer' }),
    })
    .optional(),

  isActive: z.boolean().optional(),
  isVerified: z.boolean().optional(),
});

const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Tên phải có ít nhất 2 ký tự')
    .max(100, 'Tên không được vượt quá 100 ký tự')
    .trim()
    .optional(),
});

// ─────────────────────────────────────────────────────
// USER PROFILE VALIDATION SCHEMAS
// ─────────────────────────────────────────────────────

const emptyToUndefined = (val) => (val === '' ? undefined : val);

const updateUserProfileSchema = z.object({
  phone: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .regex(/^(\+84|84|0)[3|5|7|8|9][0-9]{8}$/, 'Số điện thoại không hợp lệ')
      .optional(),
  ),

  name: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .min(2, 'Tên phải có ít nhất 2 ký tự')
      .max(100, 'Tên không được vượt quá 100 ký tự')
      .trim()
      .optional(),
  ),

  birthday: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày sinh phải có định dạng YYYY-MM-DD')
      .optional(),
  ),

  gender: z.preprocess(emptyToUndefined, z.enum(['male', 'female', 'other']).optional()),
});

// ─────────────────────────────────────────────────────
// ADDRESS VALIDATION SCHEMAS
// ─────────────────────────────────────────────────────

const createAddressSchema = z.object({
  type: z.enum(['home', 'work', 'billing', 'shipping'], {
    errorMap: () => ({ message: 'Loại địa chỉ không hợp lệ' }),
  }),

  name: z
    .string()
    .min(2, 'Tên phải có ít nhất 2 ký tự')
    .max(100, 'Tên không được vượt quá 100 ký tự')
    .trim(),

  phone: z
    .string()
    .min(10, 'Số điện thoại phải có ít nhất 10 ký tự')
    .max(15, 'Số điện thoại không được vượt quá 15 ký tự')
    .trim(),

  address_detail: z
    .string()
    .min(5, 'Địa chỉ chi tiết phải có ít nhất 5 ký tự')
    .max(255, 'Địa chỉ chi tiết không được vượt quá 255 ký tự')
    .trim(),

  ward: z
    .string()
    .min(2, 'Phường/Xã phải có ít nhất 2 ký tự')
    .max(100, 'Phường/Xã không được vượt quá 100 ký tự')
    .trim(),

  city: z
    .string()
    .min(2, 'Thành phố phải có ít nhất 2 ký tự')
    .max(100, 'Thành phố không được vượt quá 100 ký tự')
    .trim(),

  is_default: z.boolean().optional(),
});

const updateAddressSchema = createAddressSchema.partial();

// ─────────────────────────────────────────────────────
// PRODUCT VALIDATION SCHEMAS
// ─────────────────────────────────────────────────────

const createProductSchema = z.object({
  category_id: z
    .number()
    .int('ID danh mục phải là số nguyên')
    .positive('ID danh mục phải là số dương'),

  name: z
    .string()
    .min(2, 'Tên sản phẩm phải có ít nhất 2 ký tự')
    .max(255, 'Tên sản phẩm không được vượt quá 255 ký tự')
    .trim(),

  description: z.string().max(10000, 'Mô tả không được vượt quá 10000 ký tự').optional(),

  short_description: z.string().max(500, 'Mô tả ngắn không được vượt quá 500 ký tự').optional(),

  sku: z.string().max(100, 'SKU không được vượt quá 100 ký tự').trim().optional(),

  price: z
    .number()
    .positive('Giá phải là số dương')
    .max(999999.99, 'Giá không được vượt quá 999,999.99'),

  compare_price: z
    .number()
    .positive('Giá so sánh phải là số dương')
    .max(999999.99, 'Giá so sánh không được vượt quá 999,999.99')
    .optional(),

  cost_price: z
    .number()
    .positive('Giá gốc phải là số dương')
    .max(999999.99, 'Giá gốc không được vượt quá 999,999.99')
    .optional(),

  weight: z
    .number()
    .positive('Trọng lượng phải là số dương')
    .max(999.999, 'Trọng lượng không được vượt quá 999.999')
    .optional(),

  dimensions: z
    .object({
      length: z.number().positive('Chiều dài phải là số dương').optional(),
      width: z.number().positive('Chiều rộng phải là số dương').optional(),
      height: z.number().positive('Chiều cao phải là số dương').optional(),
    })
    .optional(),

  tags: z.array(z.string()).optional(),
  product_attributes: z.record(z.any()).optional(),

  status: z.enum(['draft', 'active', 'inactive', 'archived']).default('draft'),

  visibility: z.enum(['public', 'private', 'hidden']).default('public'),

  allow_backorders: z.boolean().default(false),
  sold_individually: z.boolean().default(false),
  featured: z.boolean().default(false),

  seo_title: z.string().max(255, 'Tiêu đề SEO không được vượt quá 255 ký tự').optional(),

  seo_description: z.string().max(500, 'Mô tả SEO không được vượt quá 500 ký tự').optional(),
});

const updateProductSchema = createProductSchema.partial();

// ─────────────────────────────────────────────────────
// CATEGORY VALIDATION SCHEMAS
// ─────────────────────────────────────────────────────

const createCategorySchema = z.object({
  name: z
    .string()
    .min(2, 'Tên danh mục phải có ít nhất 2 ký tự')
    .max(100, 'Tên danh mục không được vượt quá 100 ký tự')
    .trim(),

  slug: z
    .string()
    .min(2, 'Slug phải có ít nhất 2 ký tự')
    .max(120, 'Slug không được vượt quá 120 ký tự')
    .regex(/^[a-z0-9-]+$/, 'Slug chỉ chứa chữ thường, số và dấu gạch ngang')
    .trim()
    .optional(),

  description: z
    .string()
    .max(10000, 'Mô tả không được vượt quá 10000 ký tự')
    .optional()
    .or(z.literal('').nullable()),

  parent_id: z
    .number()
    .int('ID danh mục cha phải là số nguyên')
    .positive('ID danh mục cha phải là số dương')
    .optional()
    .or(z.literal(null).nullable()),

  image: z
    .string()
    .url('URL hình ảnh không hợp lệ')
    .max(500, 'URL hình ảnh không được vượt quá 500 ký tự')
    .optional()
    .or(z.literal(null).nullable()),

  is_active: z.boolean().default(true),
  sort_order: z.number().int().min(0).default(0),
});

const updateCategorySchema = createCategorySchema.partial();

// ─────────────────────────────────────────────────────
// ORDER VALIDATION SCHEMAS
// ─────────────────────────────────────────────────────

const createOrderSchema = z.object({
  shipping_address_id: z
    .number()
    .int('ID địa chỉ giao hàng phải là số nguyên')
    .positive('ID địa chỉ giao hàng phải là số dương'),

  payment_method: z.enum(['cod', 'momo', 'vnpay']).default('cod'),

  order_items: z
    .array(
      z.object({
        product_id: z
          .number()
          .int('ID sản phẩm phải là số nguyên')
          .positive('ID sản phẩm phải là số dương'),

        quantity: z
          .number()
          .int('Số lượng phải là số nguyên')
          .positive('Số lượng phải là số dương')
          .max(999, 'Số lượng không được vượt quá 999'),
      }),
    )
    .min(1, 'Đơn hàng phải có ít nhất một sản phẩm'),

  notes: z.string().max(1000, 'Ghi chú không được vượt quá 1000 ký tự').optional(),
});

// ─────────────────────────────────────────────────────
// WISHLIST VALIDATION SCHEMAS
// ─────────────────────────────────────────────────────

const addToWishlistSchema = z.object({
  product_id: z
    .number()
    .int('ID sản phẩm phải là số nguyên')
    .positive('ID sản phẩm phải là số dương'),
});

// ─────────────────────────────────────────────────────
// PAGINATION & QUERY SCHEMAS
// ─────────────────────────────────────────────────────

const paginationSchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/)
    .transform((val) => parseInt(val))
    .refine((val) => val > 0, 'Page phải là số dương')
    .optional(),
  limit: z
    .string()
    .regex(/^\d+$/)
    .transform((val) => parseInt(val))
    .refine((val) => val > 0 && val <= 100, 'Limit phải từ 1-100')
    .optional(),
  page_size: z
    .string()
    .regex(/^\d+$/)
    .transform((val) => parseInt(val))
    .refine((val) => val > 0 && val <= 100, 'Page size phải từ 1-100')
    .optional(),
  current_page: z
    .string()
    .regex(/^\d+$/)
    .transform((val) => parseInt(val))
    .refine((val) => val > 0, 'Current page phải là số dương')
    .optional(),
});

const userListQuerySchema = paginationSchema.extend({
  search: z.string().max(100).optional(),
  role: z.enum(['admin', 'vendor', 'customer']).optional(),
  isActive: z
    .string()
    .regex(/^(true|false)$/)
    .transform((val) => val === 'true')
    .optional(),
});

const productListQuerySchema = paginationSchema.extend({
  search: z.string().max(100).optional(),
  category_id: z
    .string()
    .regex(/^\d+$/)
    .transform((val) => parseInt(val))
    .optional(),
  vendor_id: z
    .string()
    .regex(/^\d+$/)
    .transform((val) => parseInt(val))
    .optional(),
  status: z.enum(['draft', 'active', 'inactive', 'archived']).default('active'),
  visibility: z.enum(['public', 'private', 'hidden']).default('public'),
  min_price: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .transform((val) => parseFloat(val))
    .optional(),
  max_price: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .transform((val) => parseFloat(val))
    .optional(),
  sort_by: z.enum(['createdAt', 'name', 'price', 'updatedAt']).default('createdAt'),
  sort_order: z.enum(['ASC', 'DESC']).default('DESC'),
});

const orderListQuerySchema = paginationSchema.extend({
  status: z
    .enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'])
    .optional(),
});

const createVendorSchema = z.object({
  store_name: z.string().min(2).max(100),
  description: z.string().max(1000).optional().or(z.literal('').nullable()),
  contact_email: z.email('Email không hợp lệ').max(255).optional().or(z.literal('').nullable()),
  contact_phone: z
    .string()
    .regex(/^(\+84|84|0)(3|5|7|8|9)[0-9]{8}$/, 'Số điện thoại không hợp lệ')
    .max(20)
    .optional()
    .or(z.literal('').nullable()),
  address: z.string().max(1000).optional().or(z.literal('').nullable()),
  business_type: z.enum(['individual', 'business', 'enterprise']).default('individual'),
  status: z.enum(['pending', 'active', 'suspended', 'inactive']).default('pending'),
});

const updateVendorSchema = createVendorSchema.partial();

module.exports = {
  // Auth schemas
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
  changePasswordSchema,

  // User schemas
  updateUserSchema,
  updateProfileSchema,
  updateUserProfileSchema,

  // Address schemas
  createAddressSchema,
  updateAddressSchema,

  // Product schemas
  createProductSchema,
  updateProductSchema,

  // Category schemas
  createCategorySchema,
  updateCategorySchema,

  // Order schemas
  createOrderSchema,

  // Wishlist schemas
  addToWishlistSchema,

  // Vendor schemas
  createVendorSchema,
  updateVendorSchema,

  // Query schemas
  userListQuerySchema,
  productListQuerySchema,
  orderListQuerySchema,

  // Param schemas
  idParamSchema,
};
