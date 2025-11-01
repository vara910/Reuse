# Quick Start Guide

## 🚀 Start the Application in 5 Minutes

### Step 1: Start Backend (Terminal 1)

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python init_db.py
python app.py
```

Backend will run at: http://localhost:5000

### Step 2: Start Frontend (Terminal 2)

```bash
cd frontend
npm install
npm run dev
```

Frontend will run at: http://localhost:5173

### Step 3: Test the Application

1. Open browser: http://localhost:5173
2. Click **Register**
3. Create a **Vendor** account:
   - Email: `vendor@test.com`
   - Password: `password123`
   - Role: Select "Vendor"
   - Business Name: "Test Store"

4. As Vendor, go to Dashboard and add sample products with expiry dates

5. Logout and register as **Customer**:
   - Email: `customer@test.com`
   - Password: `password123`
   - Role: Select "Customer"

6. Browse products, add to cart, and complete checkout!

## ✅ What You Have

### Backend (100% Complete) ✅
- REST API with all endpoints
- User authentication (JWT)
- Product management
- Shopping cart
- Order management
- Vendor dashboard
- Database with sample categories

### Frontend (100% Complete) ✅
- Home page with featured products
- Product listing with filters
- Product details
- Shopping cart
- Checkout process
- Order history
- User profile
- Vendor dashboard
- Responsive design

## 📋 Features Working

**For Customers:**
- ✅ Browse products with discounts
- ✅ Filter by category, price, expiry date
- ✅ Search products
- ✅ Add to cart
- ✅ Checkout with address form
- ✅ View order history
- ✅ Update profile

**For Vendors:**
- ✅ Dashboard with statistics
- ✅ View all products
- ✅ Add new products (via API)
- ✅ Track sales and revenue
- ✅ View orders

## 🔧 Test with Sample Data

### Add Products via Backend (As Vendor)

After registering as vendor, you can add products using the API:

```bash
curl -X POST http://localhost:5000/api/vendor/products \
-H "Authorization: Bearer YOUR_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "name": "Milk 1L",
  "description": "Fresh milk expiring soon",
  "category_id": 2,
  "original_price": 60,
  "discounted_price": 40,
  "stock_quantity": 50,
  "expiry_date": "2025-11-05",
  "brand": "Amul"
}'
```

Or use the following test products:

1. **Bread** - Category: Bakery (ID: 3)
   - Original: ₹40, Discounted: ₹25
   - Expiry: 2025-11-02

2. **Yogurt** - Category: Dairy (ID: 2)
   - Original: ₹50, Discounted: ₹30
   - Expiry: 2025-11-01

3. **Bananas** - Category: Fruits & Vegetables (ID: 4)
   - Original: ₹80, Discounted: ₹50
   - Expiry: 2025-10-30

## 🐛 Troubleshooting

**Backend won't start:**
```bash
# Make sure Python 3.9+ is installed
python --version

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

**Frontend won't start:**
```bash
# Make sure Node.js 16+ is installed
node --version

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**CORS errors:**
- Ensure backend is running on port 5000
- Check .env file has correct API URL
- Restart both servers

**Can't login:**
- Check backend logs for errors
- Verify database was initialized
- Try registering a new account

## 📦 Deployment Ready

The application is deployment-ready for:
- **Backend**: Railway, Heroku, AWS, Google Cloud
- **Frontend**: Vercel, Netlify, AWS S3

See README.md and IMPLEMENTATION_GUIDE.md for detailed deployment instructions.

## 🎯 Next Steps

1. ✅ Test all user flows
2. ✅ Add more sample products
3. ✅ Test vendor features
4. ✅ Verify checkout process
5. 🚀 Deploy to production

## 📞 Need Help?

- Check IMPLEMENTATION_GUIDE.md for detailed info
- Review API documentation in backend/README.md
- Test API endpoints using curl or Postman
- Check browser console for frontend errors
- Check terminal for backend errors

## 🎉 You're All Set!

Your surplus e-commerce platform is ready to reduce waste and help communities access affordable products!

---

**Remember:**
- Use strong passwords in production
- Set proper environment variables
- Use PostgreSQL for production database
- Enable SSL/HTTPS in production
- Implement proper error handling
- Add comprehensive testing before deployment
