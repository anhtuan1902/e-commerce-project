const sequelize = require('./sequelize');
const fs = require('fs');
const path = require('path');

// ===========================================
// CONNECT WITH RETRY
// ===========================================

const connectDB = async ({ retries = 10, delay = 5000 } = {}) => {
  for (let i = retries; i > 0; i--) {
    try {
      await sequelize.authenticate();
      console.log('[DB] Connection established successfully');
      return;
    } catch (err) {
      if (i === 1) throw new Error(`[DB] Failed after ${retries} retries: ${err.message}`);
      console.warn(`[DB] Retry... ${i - 1} left (${err.message})`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
};

// ===========================================
// LOAD MODELS
// ===========================================

const loadModels = () => {
  const models = {};
  const modelsPath = path.join(__dirname, '../models');

  fs.readdirSync(modelsPath)
    .filter((file) => file.endsWith('.js') && !file.startsWith('__'))
    .forEach((file) => {
      const model = require(path.join(modelsPath, file));
      const modelName = file.replace('.js', '');
      
      if (model.init && !model.sequelize) {
        model.init(sequelize);
      }
      models[modelName] = model;
    });

  Object.values(models).forEach((model) => {
    if (model.associate) model.associate(models);
  });

  return models;
};

// Load models and associations
const models = loadModels();

module.exports = {
  connectDB,
  sequelize,
  ...models,
};
