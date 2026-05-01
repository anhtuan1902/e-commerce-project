const sequelize = require('./connector');
const fs = require('fs');
const path = require('path');

const getDbInfo = () => {
  const dialect = process.env.DB_DIALECT ?? 'postgres';
  
  return {
    dialect,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
  };
};

const connectDB = async ({ retries = 10, delay = 5000 } = {}) => {
  for (let i = retries; i > 0; i--) {
    try {
      await sequelize.authenticate();
      const dbInfo = getDbInfo();
      console.log(`[DB] Connected to ${dbInfo.dialect}@${dbInfo.host}/${dbInfo.database}`);
      return;
    } catch (err) {
      if (i === 1) throw new Error(`[DB] Failed after ${retries} retries: ${err.message}`);
      console.warn(`[DB] Retry... ${i - 1} left`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
};

// Load all models
const loadModels = () => {
  const models = {};

  // Load models from models directory
  const modelsPath = path.join(__dirname, '../models');
  const modelFiles = fs
    .readdirSync(modelsPath)
    .filter((file) => file.endsWith('.js') && !file.startsWith('__'));

  modelFiles.forEach((file) => {
    const model = require(path.join(modelsPath, file));
    const modelName = file.replace('.js', '');
    // Initialize class-based models that are not yet initialized
    if (model.init && !model.sequelize) {
      model.init(sequelize);
    }
    models[modelName] = model;
  });

  return models;
};

// Initialize associations
const initAssociations = (models) => {
  Object.keys(models).forEach((modelName) => {
    if (models[modelName].associate) {
      models[modelName].associate(models);
    }
  });
};

// Load models and associations
const models = loadModels();
initAssociations(models);

module.exports = {
  connectDB,
  sequelize,
  ...models,
};
