# Eclora Admin Panel - Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Running Eclora backend server

### Step 1: Install Dependencies

```bash
cd admin-panel
npm install --legacy-peer-deps
```

Note: We use `--legacy-peer-deps` to resolve React 19 compatibility issues.

### Step 2: Configure Environment

Create a `.env` file in the `admin-panel` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

**Important:** Make sure this matches your backend API URL.

### Step 3: Start Development Server

```bash
npm run dev
```

The admin panel will be available at: **http://localhost:5173**

### Step 4: Login

Use your admin credentials created in the backend:
- Email: Your admin email
- Password: Your admin password
- Role: Must be "admin"

## 📋 Backend Requirements

Before using the admin panel, ensure your backend has:

### 1. Admin User Created

Create an admin user in your backend:

```javascript
// Example: In your backend
const user = await User.create({
  name: 'Admin',
  email: 'admin@eclora.com',
  password: 'securepassword', // Will be hashed
  role: 'admin'
});
```

### 2. Required API Endpoints

The following endpoints must be implemented in your backend:

#### Authentication
- `POST /api/auth/login` - Login with email/password, returns JWT token and user

#### Dashboard
- `GET /api/dashboard/stats` - Returns total revenue, users, products, orders
- `GET /api/dashboard/sales` - Returns sales data for charts
- `GET /api/dashboard/recent-orders` - Returns recent orders list

#### Products
- `GET /api/products` - List all products
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `POST /api/products/upload` - Upload product image

#### Categories
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category
- `POST /api/categories/upload` - Upload category image

#### Orders
- `GET /api/orders` - List all orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id` - Update order status

#### Users
- `GET /api/users` - List all users
- `PUT /api/users/:id/role` - Update user role
- `DELETE /api/users/:id` - Delete user

#### Banners
- `GET /api/banners` - List all banners
- `POST /api/banners` - Create banner
- `PUT /api/banners/:id` - Update banner
- `DELETE /api/banners/:id` - Delete banner
- `POST /api/banners/upload` - Upload banner image

#### Coupons
- `GET /api/coupons` - List all coupons
- `POST /api/coupons` - Create coupon
- `PUT /api/coupons/:id` - Update coupon
- `DELETE /api/coupons/:id` - Delete coupon
- `POST /api/coupons/validate` - Validate coupon code

#### Settings
- `GET /api/settings` - Get store settings
- `PUT /api/settings` - Update settings

### 3. CORS Configuration

Your backend must allow requests from the admin panel:

```javascript
// backend/index.js
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:5173', // Admin panel dev
    'https://your-admin-url.com' // Admin panel production
  ],
  credentials: true
}));
```

### 4. Authentication Middleware

Protect admin routes with authentication:

```javascript
// Example middleware
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Protect routes
app.use('/api/products', authMiddleware, productRoutes);
```

## 🔧 Common Issues & Solutions

### Issue: "Cannot connect to backend"
**Solution:** 
- Verify backend is running
- Check VITE_API_URL in .env file
- Ensure CORS is configured correctly

### Issue: "Login failed" or "Access denied"
**Solution:**
- Verify user exists in database
- Ensure user role is "admin"
- Check if password is correct

### Issue: "Token expired"
**Solution:**
- Login again to get new token
- Increase JWT expiry time in backend

### Issue: "Image upload failed"
**Solution:**
- Configure Cloudinary credentials in backend
- Check file size limits
- Verify upload endpoint exists

### Issue: "Module not found" errors
**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

## 📦 Building for Production

```bash
npm run build
```

This creates an optimized build in the `dist` folder.

### Deploy to Vercel

```bash
npm i -g vercel
vercel --prod
```

Configure environment variables in Vercel:
- VITE_API_URL: Your production backend URL

### Deploy to Netlify

1. Build the project: `npm run build`
2. Upload `dist` folder to Netlify
3. Set environment variable: `VITE_API_URL`

## 🧪 Testing the Admin Panel

### 1. Test Authentication
- Try logging in with correct credentials
- Try logging in with incorrect credentials
- Verify redirect after login

### 2. Test Products
- Create a new product
- Upload product image
- Edit product details
- Delete a product

### 3. Test Categories
- Create category
- Upload category image
- Edit category
- Delete category

### 4. Test Orders
- View orders list
- Filter by status
- Update order status
- View order details

### 5. Test Coupons
- Create discount code
- Set expiry date
- Test usage limits
- Deactivate coupon

## 📱 Responsive Design

The admin panel is fully responsive and works on:
- Desktop (1920x1080 and above)
- Laptop (1366x768 and above)
- Tablet (768px and above)
- Mobile (375px and above)

## 🔒 Security Best Practices

1. **Never commit .env file** - Use .env.example instead
2. **Use strong admin passwords**
3. **Enable HTTPS in production**
4. **Set secure JWT expiry times**
5. **Implement rate limiting on backend**
6. **Validate all inputs**

## 💡 Tips

- Use Chrome DevTools for debugging
- Check Network tab for API errors
- Monitor Redux DevTools for state changes
- Check browser console for errors

## 📞 Need Help?

If you encounter issues:
1. Check this guide first
2. Review backend logs
3. Check browser console for errors
4. Verify all environment variables
5. Contact development team

---

Happy Managing! 🎉

