# B2B/B2C Separation - Completion Guide

## Current Status

✅ **Completed:**
- Database models (B2BCategory, B2BProduct, B2CCategory, B2CProduct)
- Migration script (`backend/scripts/separateB2BB2C.js`)
- B2B Category Controller

🚧 **In Progress:**
- Creating B2B Product Controller (simplified version)
- Creating routes

⏳ **To Complete:**
1. Complete B2B Product Controller (copy logic from existing, remove B2B/B2C conditionals)
2. Create B2C Category Controller (copy from B2B, change model)
3. Create B2C Product Controller (copy from B2B, adapt for B2C fields)
4. Create routes for all endpoints
5. Register routes in `backend/index.js`
6. Create dummy data seeding scripts
7. Update frontend services
8. Update admin panel

## Quick Start - Complete the Implementation

### Step 1: Complete B2B Product Controller
File: `backend/controllers/b2bProductController.js`

Copy the structure from `backend/controllers/productController.js` but:
- Replace `Product` model with `B2BProduct`
- Replace `Category` model with `B2BCategory`
- Remove all `productType` filtering logic
- Remove B2B/B2C conditional logic
- Keep B2B-specific features (volume pricing, MOQ, etc.)

### Step 2: Create B2C Controllers
- Copy B2B controllers and adapt for B2C models
- Remove B2B-specific features (volume pricing, MOQ)
- Add B2C-specific features (discountPrice, variants)

### Step 3: Create Routes

Create `backend/routes/b2bCategoryRoutes.js`:
```javascript
const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/b2bCategoryController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getAllCategories);
router.get('/:id', getCategoryById);
router.post('/', protect, admin, createCategory);
router.put('/:id', protect, admin, updateCategory);
router.delete('/:id', protect, admin, deleteCategory);

module.exports = router;
```

Create similar files for:
- `backend/routes/b2bProductRoutes.js`
- `backend/routes/b2cCategoryRoutes.js`
- `backend/routes/b2cProductRoutes.js`

### Step 4: Register Routes in `backend/index.js`

Add after existing route imports:
```javascript
const b2bCategoryRoutes = require('./routes/b2bCategoryRoutes');
const b2bProductRoutes = require('./routes/b2bProductRoutes');
const b2cCategoryRoutes = require('./routes/b2cCategoryRoutes');
const b2cProductRoutes = require('./routes/b2cProductRoutes');
```

Add in app.use section:
```javascript
app.use('/api/b2b/categories', b2bCategoryRoutes);
app.use('/api/b2b/products', b2bProductRoutes);
app.use('/api/b2c/categories', b2cCategoryRoutes);
app.use('/api/b2c/products', b2cProductRoutes);
```

### Step 5: Run Migration

```bash
cd backend
node scripts/separateB2BB2C.js
```

### Step 6: Update Frontend Services

**Business Frontend** (`business-frontend/src/services/categoryService.js`):
```javascript
getAllCategories: async () => {
  const response = await api.get('/b2b/categories'); // Changed endpoint
  return response.data.data || [];
}
```

**Regular Frontend** (`frontend/src/services/categoryService.js`):
```javascript
getAllCategories: async () => {
  const response = await api.get('/b2c/categories'); // Changed endpoint
  return response.data.data || [];
}
```

### Step 7: Update Admin Panel

Update admin panel to use separate B2B/B2C APIs based on route.

## Testing Checklist

- [ ] Migration script runs successfully
- [ ] B2B categories API returns data
- [ ] B2B products API returns data
- [ ] B2C categories API returns data
- [ ] B2C products API returns data
- [ ] Business frontend loads B2B categories
- [ ] Business frontend loads B2B products
- [ ] Regular frontend loads B2C categories
- [ ] Regular frontend loads B2C products
- [ ] Admin panel can manage B2B categories
- [ ] Admin panel can manage B2B products
- [ ] Admin panel can manage B2C categories
- [ ] Admin panel can manage B2C products

## Important Notes

1. **Keep Old Endpoints**: Don't delete old `/api/categories` and `/api/products` endpoints yet - keep for backward compatibility during transition
2. **Gradual Migration**: Update frontends one at a time, test thoroughly
3. **Data Validation**: Ensure migration script handles edge cases
4. **Backup**: Backup database before running migration

