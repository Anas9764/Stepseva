# Fix Admin Panel CORS and API URL Issues

## ✅ Fixed: Backend URL Updated

I've updated the admin panel to use the correct backend URL:
- **Before:** `https://eclora-sj6w.onrender.com/api` ❌
- **After:** `https://stepseva.onrender.com/api` ✅

---

## 🔧 Files Updated

1. **`admin-panel/src/services/api.js`**
   - Updated production URL to `https://stepseva.onrender.com/api`

2. **`admin-panel/src/utils/apiConfig.js`**
   - Updated production URL to `https://stepseva.onrender.com/api`

---

## 🚀 Next Steps

### 1. Rebuild and Redeploy Admin Panel

**If deployed on Vercel/Netlify:**

1. **Commit and push changes:**
   ```bash
   git add admin-panel/src/services/api.js admin-panel/src/utils/apiConfig.js
   git commit -m "Fix: Update admin panel backend URL to stepseva.onrender.com"
   git push
   ```

2. **Or manually redeploy:**
   - Vercel: Go to Deployments → Redeploy
   - Netlify: Trigger new deployment

### 2. Update Backend CORS (Render)

**Important:** Make sure backend allows requests from your admin panel URL.

1. **Go to Render Dashboard** → Backend service
2. **Environment tab** → Find `ADMIN_URL`
3. **Update to your admin panel URL:**
   ```
   ADMIN_URL=https://stepseva-admin.vercel.app
   ```
   Or whatever your admin panel URL is
4. **Save** (auto-redeploys)

### 3. Clear Browser Cache

After redeploy:
1. **Hard refresh:** `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. **Or clear cache** in browser settings

---

## 🔍 Verify It's Working

### Check Browser Console:

1. **Open admin panel**
2. **Open console** (F12)
3. **Look for:**
   ```
   🔗 Production mode: Using Render backend URL: https://stepseva.onrender.com/api
   ```

### Check Network Tab:

1. **Try to login**
2. **Check Network tab:**
   - Should call: `https://stepseva.onrender.com/api/auth/login`
   - Should NOT call: `https://eclora-sj6w.onrender.com/api/auth/login`
   - Status should be: `200 OK` (not CORS error)

---

## 🐛 If Still Getting CORS Errors

### Check Backend CORS Configuration:

1. **Go to Render** → Backend service → Logs
2. **Look for:**
   ```
   🌐 Allowed CORS Origins: [...]
   🔗 ADMIN_URL: https://your-admin-url.vercel.app
   ```

3. **If ADMIN_URL is not set or wrong:**
   - Update `ADMIN_URL` in Render environment variables
   - Should match your admin panel URL exactly
   - Include `https://` but no trailing slash

### Common Issues:

**Issue:** CORS Error
- **Check:** `ADMIN_URL` is set correctly in backend
- **Format:** `https://stepseva-admin.vercel.app` (no trailing slash)

**Issue:** Still Using Old URL
- **Check:** Deployment platform environment variable `VITE_API_URL`
- **Fix:** Delete or update to `https://stepseva.onrender.com/api`

---

## 📋 Checklist

- [ ] Admin panel code updated (✅ Done)
- [ ] Rebuild and redeploy admin panel
- [ ] Update `ADMIN_URL` in backend (Render)
- [ ] Clear browser cache
- [ ] Test login - should work without CORS errors
- [ ] Check console for correct API URL
- [ ] Check Network tab - should call `stepseva.onrender.com`

---

## 🎯 Summary

**What Was Fixed:**
- ✅ Admin panel API URL updated to `https://stepseva.onrender.com/api`
- ✅ Updated in both `api.js` and `apiConfig.js`

**What You Need to Do:**
1. Rebuild/redeploy admin panel
2. Update `ADMIN_URL` in backend CORS configuration
3. Clear browser cache and test

**After these steps, your admin panel should work!** 🚀

