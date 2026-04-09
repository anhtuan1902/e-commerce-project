const Address = require('../models/Address');
const { successResponse, errorResponse } = require('../utils/response.util');
const { validateBody } = require('../middlewares/validation.middleware');
const { createAddressSchema, updateAddressSchema } = require('../validations');

// ─────────────────────────────────────────────────────
// LẤY DANH SÁCH ĐỊA CHỈ CỦA USER — GET /api/addresses
// ─────────────────────────────────────────────────────
const getAddresses = async (req, res) => {
  try {
    const userId = req.user.id;
    const addresses = await Address.findAll({
      where: { user_id: userId },
      order: [
        ['is_default', 'DESC'],
        ['createdAt', 'DESC'],
      ],
    });

    return successResponse(res, addresses);
  } catch (error) {
    console.error('Get addresses error:', error);
    return errorResponse(res, 'Lỗi server');
  }
};

// ─────────────────────────────────────────────────────
// LẤY CHI TIẾT ĐỊA CHỈ — GET /api/addresses/:id
// ─────────────────────────────────────────────────────
const getAddressById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const address = await Address.findOne({
      where: { id, user_id: userId },
    });

    if (!address) return errorResponse(res, 'Không tìm thấy địa chỉ', 404);

    return successResponse(res, address);
  } catch (error) {
    console.error('Get address by id error:', error);
    return errorResponse(res, 'Lỗi server');
  }
};

// ─────────────────────────────────────────────────────
// TẠO ĐỊA CHỈ MỚI — POST /api/addresses
// ─────────────────────────────────────────────────────
const createAddress = [
  validateBody(createAddressSchema),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const {
        type,
        name,
        phone,
        address_detail,
        district,
        ward,
        city,
        is_default = false,
      } = req.body;

      const address = await Address.create({
        user_id: userId,
        type,
        name,
        phone,
        address_detail,
        district,
        ward,
        city,
        is_default,
      });

      return successResponse(res, address, 'Tạo địa chỉ thành công', 201);
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        return errorResponse(
          res,
          'Dữ liệu không hợp lệ',
          422,
          error.errors.map((e) => e.message),
        );
      }
      console.error('Create address error:', error);
      return errorResponse(res, 'Lỗi server');
    }
  },
];

// ─────────────────────────────────────────────────────
// CẬP NHẬT ĐỊA CHỈ — PUT /api/addresses/:id
// ─────────────────────────────────────────────────────
const updateAddress = [
  validateBody(updateAddressSchema),
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const {
        type,
        name,
        phone,
        address_detail,
        district,
        ward,
        city,
        is_default = false,
      } = req.body;

      const address = await Address.findOne({
        where: { id, user_id: userId },
      });

      if (!address) return errorResponse(res, 'Không tìm thấy địa chỉ', 404);

      await address.update({
        type: type || address.type,
        name: name || address.name,
        phone: phone || address.phone,
        address_detail: address_detail || address.address_detail,
        district: district || address.district,
        ward: ward || address.ward,
        city: city || address.city,
        is_default: is_default !== undefined ? is_default : address.is_default,
      });

      return successResponse(res, address, 'Cập nhật địa chỉ thành công');
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        return errorResponse(
          res,
          'Dữ liệu không hợp lệ',
          422,
          error.errors.map((e) => e.message),
        );
      }
      console.error('Update address error:', error);
      return errorResponse(res, 'Lỗi server');
    }
  },
];

// ─────────────────────────────────────────────────────
// XÓA ĐỊA CHỈ — DELETE /api/addresses/:id
// ─────────────────────────────────────────────────────
const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const address = await Address.findOne({
      where: { id, user_id: userId },
    });

    if (!address) return errorResponse(res, 'Không tìm thấy địa chỉ', 404);

    await address.destroy();
    return successResponse(res, null, 'Xóa địa chỉ thành công');
  } catch (error) {
    console.error('Delete address error:', error);
    return errorResponse(res, 'Lỗi server');
  }
};

// ─────────────────────────────────────────────────────
// ĐẶT ĐỊA CHỈ MẶC ĐỊNH — PUT /api/addresses/:id/set-default
// ─────────────────────────────────────────────────────
const setDefaultAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const address = await Address.findOne({
      where: { id, user_id: userId },
    });

    if (!address) return errorResponse(res, 'Không tìm thấy địa chỉ', 404);

    // Hook beforeSave sẽ tự động bỏ default của các địa chỉ khác
    await address.update({ is_default: true });

    return successResponse(res, address, 'Đặt địa chỉ mặc định thành công');
  } catch (error) {
    console.error('Set default address error:', error);
    return errorResponse(res, 'Lỗi server');
  }
};

module.exports = {
  getAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
