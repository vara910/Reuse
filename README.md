# Surplus E-commerce Platform

A full-stack e-commerce platform for buying and selling surplus and near-expiry products at discounted prices.

## Problem Statement

- Retail stores discard large quantities of surplus and near-expiry products daily
- Millions of consumers struggle with rising costs of daily essentials
- No efficient platform connects vendors with surplus stock to customers seeking affordable products
- Results in financial losses for businesses and unnecessary environmental waste

## Solution

This platform enables:
- Vendors to sell surplus and near-expiry products at discounted prices
- Customers to access affordable quality products
- Reduction of waste through a sustainable digital marketplace

## Tech Stack

### Backend
- Python 3.9+
- Flask (REST API)
- SQLAlchemy (ORM)
- SQLite/PostgreSQL (Database)
- JWT Authentication
- Flask-CORS, Flask-Migrate

### Frontend
- React 19
- Vite (Build tool)
- React Router (Routing)
- Axios (API calls)
- Zustand (State management)
- Tanstack Query (Data fetching)
- Lucide React (Icons)

## Features

### For Customers
- Browse products with advanced filters (category, price, expiry date)
- Search functionality
- View product details with expiry information
- Shopping cart management
- Secure checkout with multiple payment options
- Order tracking and history
- Product reviews and ratings
- Address management

### For Vendors
- Vendor dashboard with analytics
- Add/edit/delete products
- Inventory management
- Set original and discounted prices
- Track expiry dates
- View orders containing their products
- Sales statistics

### Platform Features
- Role-based access control (Customer/Vendor)
- JWT-based authentication
- Responsive design
- Real-time stock updates
- Automatic discount calculation
- Days-to-expiry tracking

## Project Structure

```
surplus-ecommerce/
├── backend/
│   ├── routes/           # API routes
│   ├── models.py         # Database models
│   ├── config.py         # Configuration
│   ├── app.py           # Main Flask app
│   ├── init_db.py       # Database initialization
│   ├── requirements.txt  # Python dependencies
│   └── Dockerfile        # Backend Docker config
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   ├── store/        # State management
│   │   └── App.jsx       # Main app component
│   ├── package.json      # Frontend dependencies
│   └── vite.config.js    # Vite configuration
└── README.md
```

## Setup Instructions

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```
FLASK_ENV=development
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
DATABASE_URL=sqlite:///surplus_dev.db
PORT=5000
```

5. Initialize database:
```bash
python init_db.py
```

6. Run backend server:
```bash
python app.py
```

Backend will run at `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```
VITE_API_URL=http://localhost:5000/api
```

4. Run development server:
```bash
npm run dev
```

Frontend will run at `http://localhost:5173`

## Deployment

### Option 1: Docker Deployment

1. Build backend Docker image:
```bash
cd backend
docker build -t surplus-backend .
docker run -p 5000:5000 --env-file .env surplus-backend
```

2. Build frontend:
```bash
cd frontend
npm run build
```

Serve the `dist` folder using any static hosting service.

### Option 2: Cloud Deployment

#### Backend (Railway/Heroku)

1. Create new project on Railway or Heroku
2. Add PostgreSQL database
3. Set environment variables:
   - `FLASK_ENV=production`
   - `SECRET_KEY=<your-secret>`
   - `JWT_SECRET_KEY=<your-jwt-secret>`
   - `DATABASE_URL=<postgres-url>`
4. Connect GitHub repository
5. Deploy

#### Frontend (Vercel/Netlify)

1. Build command: `npm run build`
2. Output directory: `dist`
3. Set environment variable:
   - `VITE_API_URL=<your-backend-url>/api`
4. Deploy

### Option 3: VPS Deployment (AWS/DigitalOcean)

1. Setup server with Ubuntu
2. Install Python, Node.js, Nginx, PostgreSQL
3. Clone repository
4. Setup backend as systemd service
5. Build frontend and configure Nginx
6. Setup SSL with Let's Encrypt

## API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update profile
- `POST /api/auth/change-password` - Change password

### Products
- `GET /api/products` - List products (with filters)
- `GET /api/products/:id` - Get product details
- `GET /api/products/featured` - Featured products
- `GET /api/products/trending` - Trending products

### Cart
- `GET /api/cart` - Get cart
- `POST /api/cart` - Add to cart
- `PUT /api/cart/:id` - Update cart item
- `DELETE /api/cart/:id` - Remove from cart
- `DELETE /api/cart/clear` - Clear cart

### Orders
- `GET /api/orders` - List orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details
- `POST /api/orders/:id/cancel` - Cancel order

### Vendor (Requires vendor role)
- `GET /api/vendor/products` - List vendor products
- `POST /api/vendor/products` - Create product
- `PUT /api/vendor/products/:id` - Update product
- `DELETE /api/vendor/products/:id` - Delete product
- `GET /api/vendor/orders` - View orders
- `GET /api/vendor/dashboard` - Dashboard stats

### Other APIs
- Categories, Addresses, Reviews endpoints available

## Database Schema

- **users** - User accounts
- **vendor_profiles** - Vendor information
- **products** - Product listings
- **categories** - Product categories
- **cart_items** - Shopping cart
- **orders** - Order records
- **order_items** - Order line items
- **addresses** - Shipping addresses
- **reviews** - Product reviews

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- CORS protection
- Input validation
- SQL injection prevention (SQLAlchemy ORM)
- XSS protection

## Testing

Backend:
```bash
cd backend
pytest
```

Frontend:
```bash
cd frontend
npm test
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

MIT License

## Support

For issues and questions, please create an issue on GitHub.

## Future Enhancements

- Payment gateway integration (Stripe/Razorpay)
- Email notifications
- SMS alerts for expiring products
- Mobile app (React Native)
- Advanced analytics dashboard
- AI-based product recommendations
- Multi-language support
- Vendor verification system
- Customer loyalty program

---

Built with ❤️ to reduce waste and help communities
