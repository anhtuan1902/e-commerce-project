require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const passport = require('./config/passport');

const {
  publicRouter: authPublicRoutes,
  protectedRouter: authProtectedRoutes,
} = require('./routes/auth.routes');

const addressRoutes = require('./routes/address.routes');
const productRoutes = require('./routes/product.routes');
const categoryRoutes = require('./routes/category.routes');
const orderRoutes = require('./routes/order.routes');
const wishlistRoutes = require('./routes/wishlist.routes');
const profilesRoutes = require('./routes/profiles.routes');
const vendorRoutes = require('./routes/vendor.routes');
const commentRoutes = require('./routes/comment.routes');

const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { connectDB } = require('./database');

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));

// init middlewares
app.use(morgan('dev'));

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: false,        
  crossOriginEmbedderPolicy: false,    
}));
app.use(compression());

// init database
connectDB().catch((err) => {
  console.error('[DB] Startup failed:', err.message);
  process.exit(1);
});

// init routes
app.use(express.json());
app.use(passport.initialize());

app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

app.use('/api/auth', authPublicRoutes);
app.use('/api/auth', authProtectedRoutes);

// app.use('/api/users', userRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/profiles', profilesRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/comments', commentRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// init handler error

module.exports = app;
