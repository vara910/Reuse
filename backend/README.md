# Surplus E-commerce Backend

Python Flask REST API for the surplus products e-commerce platform.

## Features

- JWT-based authentication
- Role-based access control (Customer/Vendor)
- Product management with expiry tracking
- Shopping cart and order management
- Address and review management
- SQLAlchemy ORM with SQLite/PostgreSQL support

## Setup

### Prerequisites

- Python 3.9+
- pip

### Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables:
```bash
copy .env.example .env
```
Edit `.env` file with your configuration.

3. Initialize database:
```bash
python init_db.py
```

4. Run the application:
```bash
python app.py
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update profile
- `POST /api/auth/change-password` - Change password

### Products
- `GET /api/products` - List all products (with filters)
- `GET /api/products/<id>` - Get product details
- `GET /api/products/featured` - Get featured products
- `GET /api/products/trending` - Get trending products

### Cart
- `GET /api/cart` - Get cart items
- `POST /api/cart` - Add to cart
- `PUT /api/cart/<id>` - Update cart item
- `DELETE /api/cart/<id>` - Remove from cart

### Orders
- `GET /api/orders` - List user orders
- `POST /api/orders` - Create new order
- `GET /api/orders/<id>` - Get order details
- `POST /api/orders/<id>/cancel` - Cancel order

### Vendor (Vendor role required)
- `GET /api/vendor/products` - List vendor products
- `POST /api/vendor/products` - Create product
- `PUT /api/vendor/products/<id>` - Update product
- `DELETE /api/vendor/products/<id>` - Delete product
- `GET /api/vendor/orders` - Get vendor orders
- `GET /api/vendor/dashboard` - Get dashboard stats

### Categories
- `GET /api/categories` - List all categories

### Addresses
- `GET /api/addresses` - List user addresses
- `POST /api/addresses` - Create address
- `PUT /api/addresses/<id>` - Update address
- `DELETE /api/addresses/<id>` - Delete address

### Reviews
- `GET /api/reviews/product/<id>` - Get product reviews
- `POST /api/reviews` - Create review

## Database Models

- **User** - User accounts (customers and vendors)
- **VendorProfile** - Extended vendor information
- **Product** - Products with expiry dates and pricing
- **Category** - Product categories
- **CartItem** - Shopping cart items
- **Order** - Customer orders
- **OrderItem** - Order line items
- **Address** - Shipping addresses
- **Review** - Product reviews and ratings

## Deployment

### Using Docker

```bash
docker build -t surplus-backend .
docker run -p 5000:5000 --env-file .env surplus-backend
```

### Using Heroku/Railway

1. Install Heroku CLI or Railway CLI
2. Create new app
3. Add PostgreSQL addon
4. Set environment variables
5. Deploy:
```bash
git push heroku main
```

### Environment Variables

- `FLASK_ENV` - Environment (development/production)
- `SECRET_KEY` - Flask secret key
- `JWT_SECRET_KEY` - JWT secret key
- `DATABASE_URL` - Database connection string
- `PORT` - Port number (default: 5000)
