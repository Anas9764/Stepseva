# Backend Integration Guide

This document provides detailed information on integrating the Eclora Admin Panel with your backend API.

## 📡 API Response Format

All API endpoints should return responses in this standard format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* your data here */ }
}
```

For errors:
```json
{
  "success": false,
  "message": "Error message here",
  "error": "Detailed error info"
}
```

## 🔐 Authentication Implementation

### Login Endpoint

**Endpoint:** `POST /api/auth/login`

**Request:**
```json
{
  "email": "admin@eclora.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt-token-here",
    "user": {
      "_id": "user-id",
      "name": "Admin User",
      "email": "admin@eclora.com",
      "role": "admin"
    }
  }
}
```

**Backend Implementation Example:**
```javascript
// authController.js
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
```

## 📊 Dashboard Endpoints

### Get Statistics

**Endpoint:** `GET /api/dashboard/stats`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 45678.90,
    "totalUsers": 1234,
    "totalProducts": 89,
    "totalOrders": 567
  }
}
```

**Implementation:**
```javascript
const getStats = async (req, res) => {
  try {
    const totalRevenue = await Order.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    
    res.json({
      success: true,
      data: {
        totalRevenue: totalRevenue[0]?.total || 0,
        totalUsers,
        totalProducts,
        totalOrders
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

### Get Sales Data

**Endpoint:** `GET /api/dashboard/sales?period=30days`

**Response:**
```json
{
  "success": true,
  "data": {
    "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    "values": [1200, 1900, 1500, 2100, 1800, 2400]
  }
}
```

### Get Recent Orders

**Endpoint:** `GET /api/dashboard/recent-orders?limit=5`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "order-id",
      "user": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "totalAmount": 129.99,
      "status": "Shipped",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

## 🛍️ Products Endpoints

### List Products

**Endpoint:** `GET /api/products?page=1&limit=10&search=candle`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "product-id",
      "name": "Lavender Candle",
      "description": "Premium handmade lavender candle",
      "price": 29.99,
      "stock": 50,
      "image": "https://cloudinary.com/image.jpg",
      "category": {
        "_id": "category-id",
        "name": "Candles"
      },
      "brand": "Eclora",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "totalPages": 5,
  "currentPage": 1
}
```

### Create Product

**Endpoint:** `POST /api/products`

**Request:**
```json
{
  "name": "Rose Candle",
  "description": "Beautiful rose scented candle",
  "price": 34.99,
  "stock": 30,
  "category": "category-id",
  "brand": "Eclora",
  "image": "https://cloudinary.com/image.jpg",
  "isActive": true
}
```

**Backend Schema:**
```javascript
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  image: { type: String },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  brand: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
```

### Update Product

**Endpoint:** `PUT /api/products/:id`

### Delete Product

**Endpoint:** `DELETE /api/products/:id`

## 📁 Categories Endpoints

### List Categories

**Endpoint:** `GET /api/categories`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "category-id",
      "name": "Candles",
      "description": "Premium handmade candles",
      "image": "https://cloudinary.com/image.jpg",
      "productCount": 15
    }
  ]
}
```

**Backend Implementation:**
```javascript
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    
    // Add product count
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => ({
        ...category.toObject(),
        productCount: await Product.countDocuments({ category: category._id })
      }))
    );
    
    res.json({
      success: true,
      data: categoriesWithCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

## 📦 Orders Endpoints

### List Orders

**Endpoint:** `GET /api/orders?status=Pending`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "order-id",
      "user": {
        "_id": "user-id",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "items": [
        {
          "product": {
            "_id": "product-id",
            "name": "Lavender Candle",
            "image": "https://cloudinary.com/image.jpg"
          },
          "quantity": 2,
          "price": 29.99
        }
      ],
      "subtotal": 59.98,
      "shippingCost": 5.00,
      "discount": 0,
      "totalAmount": 64.98,
      "status": "Pending",
      "paymentStatus": "Paid",
      "shippingAddress": {
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "country": "USA"
      },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Update Order Status

**Endpoint:** `PUT /api/orders/:id`

**Request:**
```json
{
  "status": "Shipped"
}
```

**Implementation:**
```javascript
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('user items.product');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Order status updated',
      data: order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

## 👥 Users Endpoints

### List Users

**Endpoint:** `GET /api/users`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "user-id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "createdAt": "2024-01-01T00:00:00Z",
      "orderCount": 5,
      "totalSpent": 299.95
    }
  ]
}
```

### Update User Role

**Endpoint:** `PUT /api/users/:id/role`

**Request:**
```json
{
  "role": "admin"
}
```

## 🖼️ Banners Endpoints

### List Banners

**Endpoint:** `GET /api/banners`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "banner-id",
      "title": "Summer Sale",
      "subtitle": "Up to 50% off",
      "image": "https://cloudinary.com/image.jpg",
      "ctaText": "Shop Now",
      "ctaLink": "/shop",
      "priority": 1,
      "isActive": true
    }
  ]
}
```

## 🏷️ Coupons Endpoints

### List Coupons

**Endpoint:** `GET /api/coupons`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "coupon-id",
      "code": "ECLORA10",
      "discountType": "percentage",
      "discountValue": 10,
      "minPurchase": 50,
      "expiryDate": "2024-12-31T23:59:59Z",
      "usageLimit": 100,
      "usageCount": 23,
      "isActive": true
    }
  ]
}
```

### Validate Coupon

**Endpoint:** `POST /api/coupons/validate`

**Request:**
```json
{
  "code": "ECLORA10",
  "orderTotal": 75.00
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "discount": 7.50,
    "finalAmount": 67.50,
    "coupon": {
      "code": "ECLORA10",
      "discountType": "percentage",
      "discountValue": 10
    }
  }
}
```

**Implementation:**
```javascript
const validateCoupon = async (req, res) => {
  try {
    const { code, orderTotal } = req.body;
    
    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(),
      isActive: true
    });
    
    if (!coupon) {
      return res.json({
        success: false,
        message: 'Invalid coupon code'
      });
    }
    
    // Check expiry
    if (new Date(coupon.expiryDate) < new Date()) {
      return res.json({
        success: false,
        message: 'Coupon has expired'
      });
    }
    
    // Check usage limit
    if (coupon.usageCount >= coupon.usageLimit) {
      return res.json({
        success: false,
        message: 'Coupon usage limit reached'
      });
    }
    
    // Check minimum purchase
    if (orderTotal < coupon.minPurchase) {
      return res.json({
        success: false,
        message: `Minimum purchase of $${coupon.minPurchase} required`
      });
    }
    
    // Calculate discount
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (orderTotal * coupon.discountValue) / 100;
    } else {
      discount = coupon.discountValue;
    }
    
    const finalAmount = orderTotal - discount;
    
    res.json({
      success: true,
      data: {
        isValid: true,
        discount,
        finalAmount,
        coupon: {
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

## ⚙️ Settings Endpoints

### Get Settings

**Endpoint:** `GET /api/settings`

**Response:**
```json
{
  "success": true,
  "data": {
    "storeName": "Eclora",
    "storeEmail": "contact@eclora.com",
    "storePhone": "+1 (555) 123-4567",
    "storeAddress": "123 Main Street, City, State, ZIP",
    "facebook": "https://facebook.com/eclora",
    "instagram": "https://instagram.com/eclora",
    "twitter": "https://twitter.com/eclora",
    "homepageTitle": "Welcome to Eclora",
    "homepageSubtitle": "Premium Handmade Candles",
    "footerText": "© 2024 Eclora. All rights reserved."
  }
}
```

## 📤 Image Upload

### Upload Endpoint

**Endpoint:** `POST /api/products/upload` (or categories/upload, banners/upload)

**Request:** multipart/form-data with `image` field

**Response:**
```json
{
  "success": true,
  "imageUrl": "https://res.cloudinary.com/your-cloud/image/upload/v123/product.jpg"
}
```

**Backend Implementation with Cloudinary:**
```javascript
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload route
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image provided'
      });
    }
    
    // Convert buffer to base64
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'eclora/products',
      resource_type: 'image'
    });
    
    res.json({
      success: true,
      imageUrl: result.secure_url
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Image upload failed'
    });
  }
});
```

## 🔒 Middleware

### Authentication Middleware

```javascript
const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

module.exports = authMiddleware;
```

### Admin Middleware

```javascript
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

module.exports = adminMiddleware;
```

### Usage

```javascript
router.get('/products', authMiddleware, adminMiddleware, getProducts);
```

## 🧪 Testing Endpoints

Use Postman or Thunder Client to test:

1. **Login:**
```
POST http://localhost:5000/api/auth/login
Body: { "email": "admin@eclora.com", "password": "password" }
```

2. **Get Products (with token):**
```
GET http://localhost:5000/api/products
Headers: { "Authorization": "Bearer your-jwt-token" }
```

---

This integration guide should help you implement all necessary backend endpoints for the Eclora Admin Panel.

