const Category = require('../models/Category');
const { successResponse, errorResponse } = require('../utils/response.util');
const { validateBody } = require('../middlewares/validation.middleware');
const { createCategorySchema, updateCategorySchema } = require('../validations');
const { buildQueryOptions } = require('../utils/queryBuilder');

// ──────────────────────────────────────────O───────────
// LẤY DANH SÁCH DANH MỤC — GET /api/categories
// ────────────────────────────────────────O─────────────
const getCategories = async (req, res) => {
  try {
    const defaultWhere = {
      is_active: req.query.is_active !== undefined ? req.query.is_active === 'true' : true,
    };

    const { where, order, limit, offset, current_page } = buildQueryOptions(
      req.query,
      defaultWhere,
    );

    // Có pagination
    if (limit !== null && offset !== null) {
      const { count, rows } = await Category.findAndCountAll({
        where,
        order,
        limit,
        offset,
      });

      return successResponse(res, {
        data: rows,
        total_items: count,
        total_pages: Math.ceil(count / limit),
        current_page,
      });
    }

    // Không pagination
    const data = await Category.findAll({
      where,
      order,
    });

    return successResponse(res, data);
  } catch (error) {
    console.error('Get categories error:', error);
    return errorResponse(res, error.message || 'Lỗi server');
  }
};

// ─────────────────────────────────────────────────────
// LẤY CHI TIẾT DANH MỤC — GET /api/categories/:id
// ─────────────────────────────────────────────────────
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'parent',
          attributes: ['id', 'name', 'slug'],
        },
        {
          model: Category,
          as: 'children',
          order: [['sort_order', 'ASC']],
        },
        {
          model: require('../models/Product'),
          as: 'products',
          where: { status: 'active', visibility: 'public' },
          required: false,
          attributes: ['id', 'name', 'slug', 'price'],
        },
      ],
    });

    if (!category) return errorResponse(res, 'Không tìm thấy danh mục', 404);

    return successResponse(res, category);
  } catch (error) {
    console.error('Get category by id error:', error);
    return errorResponse(res, 'Lỗi server');
  }
};

// ─────────────────────────────────────────────────────
// TẠO DANH MỤC MỚI (ADMIN ONLY) — POST /api/categories
// ─────────────────────────────────────────────────────
const createCategory = [
  validateBody(createCategorySchema),
  async (req, res) => {
    try {
      const {
        name,
        slug,
        description,
        parent_id,
        image,
        is_active = true,
        sort_order = 0,
      } = req.body;

      const category = await Category.create({
        name,
        slug,
        description,
        parent_id,
        image,
        is_active,
        sort_order,
      });

      return successResponse(res, category, 'Tạo danh mục thành công', 201);
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        return errorResponse(
          res,
          'Dữ liệu không hợp lệ',
          422,
          error.errors.map((e) => e.message),
        );
      }
      if (error.name === 'SequelizeUniqueConstraintError') {
        return errorResponse(res, 'Tên hoặc slug danh mục đã tồn tại', 409);
      }
      console.error('Create category error:', error);
      return errorResponse(res, 'Lỗi server');
    }
  },
];

// ─────────────────────────────────────────────────────
// CẬP NHẬT DANH MỤC (ADMIN ONLY) — PUT /api/categories/:id
// ─────────────────────────────────────────────────────
const updateCategory = [
  validateBody(updateCategorySchema),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, slug, description, parent_id, image, is_active, sort_order } = req.body;

      const category = await Category.findByPk(id);
      if (!category) return errorResponse(res, 'Không tìm thấy danh mục', 404);

      // Kiểm tra slug trùng lặp
      if (slug && slug !== category.slug) {
        const existingCategory = await Category.findOne({ where: { slug } });
        if (existingCategory) return errorResponse(res, 'Slug đã tồn tại', 409);
      }

      // Kiểm tra tên trùng lặp
      if (name && name !== category.name) {
        const existingCategory = await Category.findOne({ where: { name } });
        if (existingCategory) return errorResponse(res, 'Tên danh mục đã tồn tại', 409);
      }

      await category.update({
        name: name || category.name,
        slug: slug || category.slug,
        description: description !== undefined ? description : category.description,
        parent_id: parent_id !== undefined ? parent_id : category.parent_id,
        image: image !== undefined ? image : category.image,
        is_active: is_active !== undefined ? is_active : category.is_active,
        sort_order: sort_order !== undefined ? sort_order : category.sort_order,
      });

      return successResponse(res, category, 'Cập nhật danh mục thành công');
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        return errorResponse(
          res,
          'Dữ liệu không hợp lệ',
          422,
          error.errors.map((e) => e.message),
        );
      }
      console.error('Update category error:', error);
      return errorResponse(res, 'Lỗi server');
    }
  },
];

// ─────────────────────────────────────────────────────
// XÓA DANH MỤC (ADMIN ONLY) — DELETE /api/categories/:id
// ─────────────────────────────────────────────────────
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'children',
        },
        {
          model: require('../models/Product'),
          as: 'products',
        },
      ],
    });

    if (!category) return errorResponse(res, 'Không tìm thấy danh mục', 404);

    // Kiểm tra có danh mục con không
    if (category.children && category.children.length > 0) {
      return errorResponse(res, 'Không thể xóa danh mục có danh mục con', 400);
    }

    // Kiểm tra có sản phẩm không
    if (category.products && category.products.length > 0) {
      return errorResponse(res, 'Không thể xóa danh mục có sản phẩm', 400);
    }

    await category.destroy();
    return successResponse(res, null, 'Xóa danh mục thành công');
  } catch (error) {
    console.error('Delete category error:', error);
    return errorResponse(res, 'Lỗi server');
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
