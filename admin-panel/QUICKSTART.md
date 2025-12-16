# 🚀 Quick Start Guide - Eclora Admin Panel

Get up and running in 5 minutes!

## Step 1: Install Dependencies (2 minutes)

Open your terminal in the `admin-panel` directory:

```bash
cd admin-panel
npm install --legacy-peer-deps
```

## Step 2: Configure Environment (30 seconds)

Create a `.env` file in the `admin-panel` directory:

```bash
# Copy the example
cp .env.example .env
```

Or manually create `.env` with:

```env
VITE_API_URL=http://localhost:5000/api
```

**Important**: Update the URL to match your backend server address.

## Step 3: Start Backend Server (if not running)

Make sure your Eclora backend is running:

```bash
# In your backend directory
cd backend
npm start
```

Your backend should be running on `http://localhost:5000`

## Step 4: Start Admin Panel (30 seconds)

```bash
# In admin-panel directory
npm run dev
```

The admin panel will open at: **http://localhost:5173**

## Step 5: Login (1 minute)

### Create Admin User (if you haven't)

In your backend, create an admin user:

```javascript
// Run this in your backend console or create a seed file
const User = require('./models/User');
const bcrypt = require('bcrypt');

async function createAdmin() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await User.create({
    name: 'Admin',
    email: 'admin@eclora.com',
    password: hashedPassword,
    role: 'admin'
  });
  
  console.log('Admin created:', admin);
}

createAdmin();
```

### Login Credentials

Use these credentials to login:
- **Email**: `admin@eclora.com`
- **Password**: `admin123` (or whatever you set)

## 🎉 You're All Set!

You should now see the Dashboard with:
- Total Revenue
- Total Orders
- Total Products  
- Total Users
- Sales Chart
- Recent Orders

## 🧭 Navigation

Use the sidebar to navigate:

1. **Dashboard** - Overview and statistics
2. **Products** - Manage your products
3. **Categories** - Organize products
4. **Orders** - Process customer orders
5. **Coupons** - Create discount codes
6. **Banners** - Homepage banners
7. **Users** - User management
8. **Settings** - Store configuration

## ⚡ Quick Actions

### Add a Product
1. Click **Products** in sidebar
2. Click **Add Product** button
3. Fill in product details
4. Upload product image
5. Click **Create Product**

### Create a Coupon
1. Click **Coupons** in sidebar
2. Click **Add Coupon** button
3. Enter coupon code (e.g., `ECLORA10`)
4. Set discount type and value
5. Set expiry date
6. Click **Create Coupon**

### Update Order Status
1. Click **Orders** in sidebar
2. Find the order
3. Click the status dropdown
4. Select new status (Shipped, Completed, etc.)
5. Status updates automatically

## 🔧 Troubleshooting

### Issue: "Cannot connect to backend"
**Solution**: Check if backend is running on port 5000
```bash
# In backend directory
npm start
```

### Issue: "Login failed"
**Solution**: 
1. Verify admin user exists
2. Check if role is "admin"
3. Verify password is correct

### Issue: "Access denied"
**Solution**: User role must be "admin", not "user"

### Issue: "Module not found"
**Solution**: Run install again
```bash
npm install --legacy-peer-deps
```

## 📚 Need More Info?

- **Setup Guide**: See `SETUP.md`
- **Backend Integration**: See `BACKEND_INTEGRATION.md`
- **Full Documentation**: See `README.md`
- **Project Overview**: See `PROJECT_SUMMARY.md`

## 🆘 Common Questions

### Q: Can I change the default port?
A: Yes, in `vite.config.js`, add:
```javascript
export default defineConfig({
  server: {
    port: 3000 // Your preferred port
  }
})
```

### Q: How do I deploy to production?
A: 
```bash
npm run build
# Deploy the 'dist' folder to Vercel, Netlify, or any host
```

### Q: Where are images stored?
A: Images are uploaded to Cloudinary via your backend

### Q: How do I add more admins?
A: Go to **Users** page → Select user → Click **Make Admin**

## 🎯 Next Steps

1. ✅ Login to admin panel
2. ✅ Create some categories
3. ✅ Add products with images
4. ✅ Create discount coupons
5. ✅ Configure store settings
6. ✅ Upload homepage banners

## 💡 Pro Tips

- Use **Ctrl+K** or **Cmd+K** for quick search (coming soon)
- Keep backend running while using admin panel
- Use descriptive product names for better SEO
- Set appropriate stock levels
- Test coupons before sharing with customers

---

**Ready to manage your store!** 🎉

For support, check the documentation files or contact the development team.

