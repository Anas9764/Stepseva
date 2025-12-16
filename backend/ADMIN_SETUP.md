# 🔐 Admin User Setup Guide

This guide will help you create an admin user to access the Eclora Admin Panel.

## 📋 Prerequisites

1. ✅ Backend server must be configured
2. ✅ MongoDB must be running
3. ✅ `.env` file must have `MONGO_URI` configured

## 🚀 Quick Setup (3 Steps)

### Step 1: Create Admin User

Run this command in your `backend` directory:

```bash
npm run create-admin
```

**What this does:**
- Connects to your MongoDB database
- Checks if an admin user already exists
- Creates a new admin user with:
  - **Email:** `admin@eclora.com`
  - **Password:** `admin123`
  - **Role:** `admin`

**Expected Output:**
```
==========================================
     ECLORA ADMIN USER CREATION SCRIPT    
==========================================

🔄 Connecting to MongoDB...
✅ MongoDB Connected
-----------------------------------
🔄 Creating admin user...
✅ Admin user created successfully!
-----------------------------------
📧 Email: admin@eclora.com
👤 Name: Admin User
🔑 Role: admin
🔒 Password: admin123
-----------------------------------
✨ You can now login to the admin panel at:
🌐 http://localhost:5173/login
-----------------------------------
⚠️  IMPORTANT: Change the password after first login!
-----------------------------------
```

### Step 2: Test Login Credentials (Optional)

Verify your credentials work:

```bash
npm run test-login
```

This will test the default credentials (`admin@eclora.com` / `admin123`)

**Or test custom credentials:**
```bash
npm run test-login your-email@example.com yourpassword
```

**Expected Output:**
```
==========================================
     ECLORA LOGIN CREDENTIALS TEST        
==========================================

🔄 Connecting to MongoDB...
✅ MongoDB Connected
-----------------------------------
🔍 Looking for user: admin@eclora.com
✅ User found!
-----------------------------------
👤 Name: Admin User
📧 Email: admin@eclora.com
🔑 Role: admin
📅 Created: 2024-11-02T...
-----------------------------------
🔄 Testing password...
✅ Password is correct!
-----------------------------------
✨ This user has ADMIN privileges
🎉 You can login to the admin panel!
-----------------------------------
🌐 Admin Panel: http://localhost:5173/login
📧 Email: admin@eclora.com
🔒 Password: admin123
-----------------------------------
```

### Step 3: Login to Admin Panel

1. Open your browser
2. Go to: **http://localhost:5173/login**
3. Enter credentials:
   - **Email:** `admin@eclora.com`
   - **Password:** `admin123`
4. Click **Sign In**
5. 🎉 You're in!

---

## 🔧 Troubleshooting

### Problem: "Admin user already exists"

**Solution:**

If you want to recreate the admin user:

**Option A - Delete from MongoDB:**
```bash
# Open MongoDB shell
mongosh

# Switch to your database
use eclora

# Delete the admin user
db.users.deleteOne({ email: "admin@eclora.com" })

# Exit
exit
```

Then run `npm run create-admin` again.

**Option B - Update existing user:**
```bash
mongosh

use eclora

# Make sure user is admin
db.users.updateOne(
  { email: "admin@eclora.com" },
  { $set: { role: "admin" } }
)

exit
```

### Problem: "MongoDB Connection Error"

**Solutions:**

1. **Check if MongoDB is running:**
   ```bash
   # Windows
   net start MongoDB
   
   # Mac/Linux
   sudo systemctl start mongod
   ```

2. **Check your `.env` file:**
   ```env
   MONGO_URI=mongodb://localhost:27017/eclora
   ```
   
   Or if using MongoDB Atlas:
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/eclora
   ```

3. **Test MongoDB connection:**
   ```bash
   mongosh
   ```
   If this fails, MongoDB is not running.

### Problem: "Login failed" in admin panel

**Causes & Solutions:**

1. **Wrong credentials**
   - Run `npm run test-login` to verify credentials
   - Make sure you're using the exact email and password

2. **User is not admin**
   - Run test-login to check role
   - Update role in MongoDB:
     ```bash
     mongosh
     use eclora
     db.users.updateOne(
       { email: "admin@eclora.com" },
       { $set: { role: "admin" } }
     )
     ```

3. **Backend not running**
   - Make sure backend is running: `npm start` or `npm run dev`
   - Check it's on port 5000
   - Verify: http://localhost:5000/

4. **CORS issues**
   - Check backend CORS settings allow `http://localhost:5173`

### Problem: "Access denied" after login

**Cause:** User role is not "admin"

**Solution:**
```bash
mongosh
use eclora
db.users.updateOne(
  { email: "admin@eclora.com" },
  { $set: { role: "admin" } }
)
```

---

## 🔄 Create Multiple Admin Users

To create additional admin users, modify `createAdmin.js`:

```javascript
// Change these values
const admin = await User.create({
  name: 'Jane Admin',           // Change name
  email: 'jane@eclora.com',     // Change email
  password: 'secure-password',   // Change password
  role: 'admin'
});
```

Then run: `npm run create-admin`

---

## 📝 Default Credentials

After running the setup:

```
Email:    admin@eclora.com
Password: admin123
Role:     admin
```

**⚠️ SECURITY WARNING:**
- Change the password immediately after first login
- Use a strong password in production
- Never commit `.env` files with credentials

---

## 🎯 Quick Commands Reference

```bash
# Create admin user
npm run create-admin

# Test login credentials
npm run test-login

# Test custom credentials
npm run test-login email@example.com password123

# Start backend
npm start

# Start backend (dev mode with auto-reload)
npm run dev

# Seed sample products
npm run seed
```

---

## ✅ Verification Checklist

Before trying to login:

- [ ] MongoDB is running
- [ ] `.env` has correct `MONGO_URI`
- [ ] Ran `npm run create-admin` successfully
- [ ] Backend server is running (`npm start`)
- [ ] Admin panel is running (`npm run dev` in admin-panel folder)
- [ ] Can access http://localhost:5173/login
- [ ] Tested credentials with `npm run test-login`

---

## 🆘 Still Having Issues?

1. **Check backend logs** - Look for errors when starting the backend
2. **Check browser console** - Open DevTools (F12) and look for errors
3. **Verify database** - Check if user exists in MongoDB:
   ```bash
   mongosh
   use eclora
   db.users.find({ email: "admin@eclora.com" })
   ```

4. **Check network** - In browser DevTools, check Network tab for failed API calls

---

## 📚 Related Documentation

- **Admin Panel Setup:** See `admin-panel/QUICKSTART.md`
- **Backend API:** See `admin-panel/BACKEND_INTEGRATION.md`
- **Full Documentation:** See `admin-panel/README.md`

---

**Need Help?** Check the troubleshooting section above or review the error messages carefully.

Good luck! 🚀

