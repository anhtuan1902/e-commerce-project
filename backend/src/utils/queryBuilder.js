const { Op } = require('sequelize');

/**
 * Build Sequelize query options from request query
 * 
 * Supports:
 * - Pagination: page, limit (or page_size, current_page)
 * - Dynamic filters: any param not in reservedKeys will be added to WHERE
 * - Sort: sort_by, sort_order params
 * - Legacy search: search_data (JSON with search_columns, sort_columns)
 */
const buildQueryOptions = (query, defaultWhere = {}) => {
  const {
    page_size,
    current_page,
    search_data,
    search,
    page,
    limit,
    sort_by,
    sort_order,
    ...dynamicFilters
  } = query;

  const where = { ...defaultWhere };
  let order = [['createdAt', 'ASC']];
  let paginationLimit = null;
  let offset = null;

  // -------------------
  // DYNAMIC FILTERS (auto-detect from query params)
  // -------------------
  for (const [key, value] of Object.entries(dynamicFilters)) {
    if (value !== undefined && value !== null && value !== '') {
      where[key] = value;
    }
  }

  // -------------------
  // SEARCH (legacy JSON format)
  // -------------------
  const searchPayload = search_data ?? search;

  if (searchPayload) {
    let parsedSearch;

    try {
      parsedSearch = typeof searchPayload === 'string' ? JSON.parse(searchPayload) : searchPayload;
    } catch (err) {
      throw new Error('search_data không hợp lệ', err);
    }

    const { search_columns, sort_columns } = parsedSearch;

    // 🔍 SEARCH
    if (Array.isArray(search_columns)) {
      const searchConditions = [];

      for (const item of search_columns) {
        for (const key in item) {
          const value = item[key];

          if (value !== undefined && value !== null && value !== '') {
            searchConditions.push({
              [key]: {
                [Op.like]: `%${value}%`,
              },
            });
          }
        }
      }

      if (searchConditions.length > 0) {
        where[Op.or] = searchConditions;
      }
    }

    // 🔃 SORT (legacy from search_data)
    if (sort_columns && typeof sort_columns === 'object') {
      order = Object.keys(sort_columns).map((key) => [
        key,
        sort_columns[key].toUpperCase() === 'DESC' ? 'DESC' : 'ASC',
      ]);
    }
  }

  // -------------------
  // SORT (direct params - overrides legacy sort)
  // -------------------
  if (sort_by) {
    const sortDirection = sort_order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    order = [[sort_by, sortDirection]];
  }

  // -------------------
  // PAGINATION
  // -------------------
  const requestedLimit = page_size ?? limit;
  const requestedPage = current_page ?? page;

  if (requestedLimit !== undefined && requestedPage !== undefined) {
    paginationLimit = Math.max(parseInt(requestedLimit, 10) || 10, 1);
    const pageNumber = Math.max(parseInt(requestedPage, 10) || 1, 1);
    offset = (pageNumber - 1) * paginationLimit;
  }

  return {
    where,
    order,
    limit: paginationLimit,
    offset,
    current_page: requestedPage ? parseInt(requestedPage, 10) : null,
  };
};

module.exports = {
  buildQueryOptions,
};
