const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const passport = require('./config/passport');
const path = require('path');
require('dotenv').config();

const {
  publicRouter: authPublicRoutes,
  protectedRouter: authProtectedRoutes,
} = require('./routes/auth.routes');

const userRoutes = require('./routes/user.routes');
const addressRoutes = require('./routes/address.routes');
const productRoutes = require('./routes/product.routes');
const categoryRoutes = require('./routes/category.routes');
const orderRoutes = require('./routes/order.routes');
const wishlistRoutes = require('./routes/wishlist.routes');
const profilesRoutes = require('./routes/profiles.routes');

const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { connectDB } = require('./database');

const app = express();

// init middlewares
app.use(morgan('dev')); // for development with detailed logs
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));

// morgan('combined'); // for production with more detailed logs, including user agent and referrer
// morgan('tiny'); // for minimal logging and smaller log size
// morgan('short'); // for short logging with minimal details
// morgan('common'); // for common logging format with more details than 'tiny' but less than 'combined'
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // cho phép load ảnh cross-origin
  }),
); // security HTTP headers
app.use(compression()); // gzip compression for responses

// init database
connectDB();

// init routes
app.use(express.json());
app.use(passport.initialize());

app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

app.use('/api/auth', authPublicRoutes);
app.use('/api/auth', authProtectedRoutes);

// app.use('/api/users', userRoutes);
app.use('/api/addresses', addressRoutes);
// app.use('/api/products', productRoutes);
// app.use('/api/categories', categoryRoutes);
// app.use('/api/orders', orderRoutes);
// app.use('/api/wishlist', wishlistRoutes);
app.use('/api/profiles', profilesRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// init handler error

module.exports = app;
