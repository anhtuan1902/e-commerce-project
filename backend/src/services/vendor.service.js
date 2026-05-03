const Vendor = require('../models/Vendor');
const fs = require('fs');
const path = require('path');
const { buildQueryOptions } = require('../utils/queryBuilder');

const getVendorService = async (query) => {
  const { where, order, limit, offset } = buildQueryOptions(query);

  const safeOrder = Array.isArray(order) ? order : [];

  const hasPagination = Number.isInteger(limit) && Number.isInteger(offset) && limit > 0;

  if (hasPagination) {
    const { count, rows: vendors } = await Vendor.findAndCountAll({
      where,
      order: safeOrder,
      limit,
      offset,
    });

    return {
      data: vendors,
      total_items: count,
      total_pages: Math.ceil(count / limit),
    };
  }

  const vendors = await Vendor.findAll({
    where,
    order: safeOrder,
  });

  return vendors;
};

const getVendorByIdService = async (id) => {
  const vendor = await Vendor.findByPk(id);
  return vendor;
};

const updateVendorService = async (id, body, file) => {
  const vendor = await Vendor.findByPk(id);
  if (!vendor) {
    throw new Error('Vendor not found');
  }
  const { store_name, description, address, contact_email, contact_phone } = body;

  const data = {};
  if (store_name !== undefined) data.store_name = store_name;
  if (description !== undefined) data.description = description;
  if (address !== undefined) data.address = address;
  if (contact_email !== undefined) data.contact_email = contact_email;
  if (contact_phone !== undefined) data.contact_phone = contact_phone;

  if (file) {
    data.logo_url = `/uploads/vendors/${file.filename}`;
    if (vendor.logo_url) {
      const oldPath = path.join('src', vendor.logo_url);
      fs.unlinkSync(oldPath, (err) => {
        if (err) console.error('Error deleting old logo:', err);
      });
    }
  }

  await vendor.update(data);

  return vendor;
};

const deleteVendorService = async (id) => {
  const vendor = await Vendor.findByPk(id);
  if (!vendor) {
    throw new Error('Vendor not found');
  }

  await vendor.destroy();
};

module.exports = {
  getVendorService,
  getVendorByIdService,
  updateVendorService,
  deleteVendorService,
};
