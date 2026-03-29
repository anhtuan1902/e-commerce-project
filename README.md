# Multi-Vendor eCommerce Marketplace

A modern, scalable multi-vendor marketplace platform that enables multiple sellers to manage and sell their products on a single unified platform. Built with Node.js and MySQL, featuring comprehensive vendor management, product catalogs, order fulfillment, and payment gateway integration.

## 📋 Table of Contents

- [Features](#features)
- [Applications](#applications)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development](#development)
- [Deployment](#deployment)
- [Skills & Expertise](#skills--expertise)

## ✨ Features

### Vendor Management

- **Vendor Subscriptions**: Flexible subscription models for different vendor tiers
- **Vendor Dashboard**: Complete control panel for vendors to manage their presence
- **Multi-Vendor Support**: Unlimited vendors can operate simultaneously on the platform

### Product Management

- **Product Catalog**: Rich product listings with multiple categories
- **Inventory Management**: Real-time inventory tracking and updates
- **Product Analytics**: Vendor insights on sales and performance

### Customer Experience

- **Product Reviews & Ratings**: Customers can leave detailed reviews and ratings
- **Wishlists & Favorites**: Personalized shopping experience
- **User Authentication**: Secure login and account management

### Order & Payment Processing

- **Order Fulfillment**: Complete order tracking and fulfillment workflow
- **Payment Gateway Integration**:
  - Stripe integration for credit/debit card payments
  - PayPal integration for digital wallet payments
- **Order History**: Comprehensive order tracking for customers and vendors

### Platform Features

- **Authorization & Security**: Role-based access control (marketplace owner, vendors, customers)
- **Rate Limiting**: API protection against abuse
- **Real-time Updates**: Redis-based caching for optimal performance

## 🎯 Applications

- **Marketplace Platforms**: Similar to Amazon, Etsy, and Shopify
- **Multi-Seller eCommerce**: B2B2C business models
- **Niche Marketplaces**: Industry-specific selling platforms
- **White-label Solutions**: Customizable marketplace for businesses

## 🛠️ Tech Stack

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: JavaScript

### Database

- **Primary Database**: MongoDB (product and vendor data management)
- **Caching**: Redis (performance optimization)

### Payment Integration

- **Stripe**: For credit/debit card processing
- **PayPal**: For digital wallet payments

### Frontend

- **Framework**: React (Vite)
- **Styling**: CSS
- **Build Tool**: Vite

### DevOps & Deployment

- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Nginx**: Reverse proxy and web server

## 📁 Project Structure

```
e-commerce-project/
├── backend/                      # Node.js/Express API server
│   ├── src/
│   │   ├── config/              # Configuration files (database, passport, redis, swagger)
│   │   ├── controllers/          # Request handlers for business logic
│   │   ├── middlewares/          # Custom middlewares (auth, rate limiting)
│   │   ├── models/              # MongoDB schemas
│   │   ├── routes/              # API route definitions
│   │   ├── services/            # Business logic and external service calls
│   │   ├── utils/               # Utility functions (JWT, response formatting)
│   │   └── validations/         # Request validation schemas
│   ├── database/
│   │   ├── migrations/          # Database schema migrations
│   │   └── seeders/             # Initial data seeders
│   ├── Dockerfile               # Development Docker image
│   ├── Dockerfile.prod          # Production Docker image
│   └── package.json             # Node.js dependencies
├── frontend/                     # React + Vite application
│   ├── src/
│   │   ├── App.jsx              # Main React component
│   │   ├── main.jsx             # Entry point
│   │   └── index.css            # Global styles
│   ├── Dockerfile               # Development image
│   ├── Dockerfile.prod          # Production image
│   ├── nginx.conf               # Nginx configuration
│   ├── vite.config.js           # Vite configuration
│   └── package.json             # npm dependencies
├── database/                     # Database service configuration
│   └── docker-compose.yml       # Database container setup
├── docker-compose.yml           # Development environment
├── docker-compose.prod.yml      # Production environment
├── Makefile                     # Build and deployment commands
└── README.md                    # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Redis
- Docker & Docker Compose (optional, for containerized setup)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd e-commerce-project
   ```

2. **Install dependencies**
   - Backend:
     ```bash
     cd backend
     npm install
     cd ..
     ```
   - Frontend:
     ```bash
     cd frontend
     npm install
     cd ..
     ```

3. **Configure environment variables**
   - Backend: Create `.env` in the `backend/` directory with required credentials
   - Frontend: Create `.env` in the `frontend/` directory with API endpoints

4. **Database setup**
   ```bash
   cd backend
   npm run migrate          # Run migrations
   npm run seed            # Seed initial data (optional)
   cd ..
   ```

## 💻 Development

### Start services locally

**Using Docker Compose**:

```bash
docker-compose up
```

**Or manually**:

1. Start MongoDB and Redis services
2. Backend:
   ```bash
   cd backend
   npm start
   ```
3. Frontend (in another terminal):
   ```bash
   cd frontend
   npm run dev
   ```

### Available Scripts

- **Backend**:
  - `npm start` - Start the server
  - `npm run dev` - Start with hot reload
  - `npm test` - Run tests
  - `npm run migrate` - Run database migrations
  - `npm run seed` - Seed database

- **Frontend**:
  - `npm run dev` - Start development server
  - `npm run build` - Build for production
  - `npm run lint` - Run ESLint
  - `npm run preview` - Preview production build

## 📦 Deployment

### Production Deployment

**Using Docker Compose**:

```bash
docker-compose -f docker-compose.prod.yml up
```

Or use the Makefile:

```bash
make deploy-prod
```

**Key Features**:

- Optimized Docker images with multi-stage builds
- Nginx reverse proxy for frontend and API gateway
- MongoDB and Redis running in separate containers
- Environment-specific configurations

### Environment Variables

Required environment variables (backend):

- `NODE_ENV` - Environment (development/production)
- `MONGODB_URI` - MongoDB connection string
- `REDIS_URL` - Redis server URL
- `JWT_SECRET` - Secret key for JWT tokens
- `STRIPE_API_KEY` - Stripe API credentials
- `PAYPAL_CLIENT_ID` - PayPal credentials

## 🎓 Skills & Expertise

This project demonstrates expertise in:

### **eCommerce Development**

- Multi-vendor marketplace architecture
- Product catalog management
- Order processing and fulfillment workflows
- Shopping cart and checkout systems

### **Marketplace Management**

- Vendor onboarding and subscription management
- Commission handling and vendor payouts
- Dispute resolution and customer service
- Analytics and reporting

### **Payment Gateway Integration**

- Stripe payment processing
- PayPal integration
- Secure transaction handling
- PCI DSS compliance considerations

### **Additional Technical Skills**

- RESTful API design
- Database design and optimization
- Authentication and authorization (JWT, Passport.js)
- Rate limiting and API security
- Docker containerization and deployment
- Frontend development with React/Vite

## 📝 API Documentation

API documentation is available via Swagger/OpenAPI. Access it at:

```
http://localhost:3000/api-docs
```

(when running in development mode)

## 🔒 Security

- JWT-based authentication
- Password encryption using bcrypt
- Rate limiting on sensitive endpoints
- CORS protection
- Input validation and sanitization

## 🤝 Contributing

Contributions are welcome! Please follow the existing code structure and conventions.

## 📄 License

This project is licensed under the MIT License.

## 📧 Support

For support or questions, please contact the development team or open an issue in the repository.

---

**Built with ❤️ for the next generation of eCommerce platforms**
