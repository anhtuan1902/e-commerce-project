const { validateBody } = require('../middlewares/validation.middleware');
const {
  getVendorService,
  getVendorByIdService,
  updateVendorService,
  deleteVendorService,
} = require('../services/vendor.service');
const { errorResponse, successResponse } = require('../utils/response.util');
const { updateVendorSchema } = require('../validations');

const getVendors = async (req, res) => {
  try {
    const result = await getVendorService(req.query);
    return successResponse(res, result, 'Lấy danh sách nhà cung cấp thành công', 200);
  } catch (error) {
    return errorResponse(res, error, 500);
  }
};

const getVendorById = async (req, res) => {
  try {
    const result = await getVendorByIdService(req.params.id);
    if (!result) {
      return errorResponse(res, 'Nhà cung cấp không tồn tại', 404);
    }
    return successResponse(res, result, 'Lấy thông tin nhà cung cấp thành công', 200);
  } catch (error) {
    return errorResponse(res, error, 500);
  }
};

const updateVendor = [
  validateBody(updateVendorSchema),
  async (req, res) => {
    try {
      const vendor = await updateVendorService(req.params.id, req.body, req.file);

      return successResponse(res, vendor);
    } catch (error) {
      return errorResponse(res, error, 500);
    }
  },
];

const deleteVendor = async (req, res) => {
  try {
    await deleteVendorService(req.params.id);
    return successResponse(res, null, 'Xóa nhà cung cấp thành công');
  } catch (error) {
    return errorResponse(res, error, 500);
  }
};

module.exports = {
  getVendors,
  getVendorById,
  updateVendor,
  deleteVendor,
};
