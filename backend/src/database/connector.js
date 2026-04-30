const { Sequelize } = require('sequelize');

const getDialect = () => {
  const dialect = process.env.DB_DIALECT ?? 'postgres';
  const validDialects = ['mysql', 'postgres'];
  if (!validDialects.includes(dialect)) {
    throw new Error(`Dialect "${dialect}" không được hỗ trợ. Chọn: ${validDialects.join(', ')}`);
  }
  return dialect;
};

const getDialectOptions = () => {
  const dialect = getDialect();
  const sslEnabled = process.env.DB_SSL === 'true';

  if (dialect === 'mysql') {
    return {};
  }

  if (dialect === 'postgres') {
    return {
      ssl: sslEnabled
        ? {
            rejectUnauthorized: false,
          }
        : false,
    };
  }

  return {};
};

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ?? (getDialect() === 'postgres' ? 5432 : 3306),
    dialect: getDialect(),
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
    define: {
      underscored: false,
      timestamps: true,
    },
    dialectOptions: getDialectOptions(),
  }
);

module.exports = sequelize;
