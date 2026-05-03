'use strict';

const _ = require('lodash');

const formatResponse = ({ fields = [], object = {} }) => {
  return _.pick(object, fields);
};

module.exports = formatResponse;
