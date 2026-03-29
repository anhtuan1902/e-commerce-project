const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const passport = require('./config/passport');
require('dotenv').config();

const {
  publicRouter: authPublicRoutes,
  protectedRouter: authProtectedRoutes,
} = require('./routes/auth.routes');

const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { connectDB } = require('./database');

const app = express();

// init middlewares
app.use(morgan('dev')); // for development with detailed logs
// morgan('combined'); // for production with more detailed logs, including user agent and referrer
// morgan('tiny'); // for minimal logging and smaller log size
// morgan('short'); // for short logging with minimal details
// morgan('common'); // for common logging format with more details than 'tiny' but less than 'combined'
app.use(helmet()); // security HTTP headers
app.use(compression()); // gzip compression for responses

// init database
connectDB();

// init routes
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(passport.initialize()); // ← KHÔNG dùng session

app.use('/api/auth', authPublicRoutes);
app.use('/api/auth', authProtectedRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// init handler error

module.exports = app;
