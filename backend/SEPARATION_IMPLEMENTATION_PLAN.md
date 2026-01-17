# B2B/B2C Separation Implementation Plan

## Overview
Complete separation of B2B and B2C flows across database, backend, and frontend.

## Status: In Progress

### ✅ Completed
1. ✅ Created new database models:
   - `B2BCategory` model
   - `B2BProduct` model
   - `B2CCategory` model
   - `B2CProduct` model

2. ✅ Created migration script:
   - `backend/scripts/separateB2BB2C.js`

3. ✅ Created B2B Category Controller:
   - `backend/controllers/b2bCategoryController.js`

### 🚧 In Progress
4. Creating B2B Product Controller
5. Creating B2C Controllers
6. Creating new API routes
7. Updating frontend services

### ⏳ Pending
8. Create dummy data seeding script
9. Update business-frontend to use new B2B APIs
10. Update frontend to use new B2C APIs
11. Update admin panel to handle separate B2B/B2C
12. Testing and validation

## Implementation Steps

### Phase 1: Database Models ✅
- [x] Create B2BCategory model
- [x] Create B2BProduct model
- [x] Create B2CCategory model
- [x] Create B2CProduct model

### Phase 2: Migration Script ✅
- [x] Create script to migrate existing data
- [x] Map old categories to new collections
- [x] Map old products to new collections
- [ ] Test migration script

### Phase 3: Backend Controllers 🚧
- [x] B2B Category Controller
- [ ] B2B Product Controller
- [ ] B2C Category Controller
- [ ] B2C Product Controller

### Phase 4: Backend Routes 🚧
- [ ] Create `/api/b2b/categories` routes
- [ ] Create `/api/b2b/products` routes
- [ ] Create `/api/b2c/categories` routes
- [ ] Create `/api/b2c/products` routes
- [ ] Register routes in `backend/index.js`

### Phase 5: Frontend Services ⏳
- [ ] Update `business-frontend/src/services/categoryService.js`
- [ ] Update `business-frontend/src/services/productService.js`
- [ ] Create/update `frontend/src/services/categoryService.js`
- [ ] Create/update `frontend/src/services/productService.js`

### Phase 6: Admin Panel ⏳
- [ ] Update admin panel to use separate APIs
- [ ] Separate B2B and B2C management sections

### Phase 7: Dummy Data & Seeding ⏳
- [ ] Create B2B category seed data
- [ ] Create B2B product seed data
- [ ] Create B2C category seed data
- [ ] Create B2C product seed data
- [ ] Create reusable seeding script

## API Endpoints Structure

### B2B Endpoints
```
GET    /api/b2b/categories          - Get all B2B categories
GET    /api/b2b/categories/:id      - Get B2B category by ID
POST   /api/b2b/categories          - Create B2B category (Admin)
PUT    /api/b2b/categories/:id      - Update B2B category (Admin)
DELETE /api/b2b/categories/:id      - Delete B2B category (Admin)

GET    /api/b2b/products            - Get all B2B products
GET    /api/b2b/products/:id        - Get B2B product by ID
POST   /api/b2b/products            - Create B2B product (Admin)
PUT    /api/b2b/products/:id        - Update B2B product (Admin)
DELETE /api/b2b/products/:id        - Delete B2B product (Admin)
```

### B2C Endpoints
```
GET    /api/b2c/categories          - Get all B2C categories
GET    /api/b2c/categories/:id      - Get B2C category by ID
POST   /api/b2c/categories          - Create B2C category (Admin)
PUT    /api/b2c/categories/:id      - Update B2C category (Admin)
DELETE /api/b2c/categories/:id      - Delete B2C category (Admin)

GET    /api/b2c/products            - Get all B2C products
GET    /api/b2c/products/:id        - Get B2C product by ID
POST   /api/b2c/products            - Create B2C product (Admin)
PUT    /api/b2c/products/:id        - Update B2C product (Admin)
DELETE /api/b2c/products/:id        - Delete B2C product (Admin)
```

## Database Collections

### New Collections (After Migration)
- `b2bcategories` - B2B categories only
- `b2bproducts` - B2B products only
- `b2ccategories` - B2C categories only
- `b2cproducts` - B2C products only

### Old Collections (Can be removed after migration)
- `categories` - Combined categories (deprecated)
- `products` - Combined products (deprecated)

## Notes
- Old endpoints (`/api/categories`, `/api/products`) should be deprecated but kept for backward compatibility during transition
- All new code should use separate B2B/B2C endpoints
- Migration script is idempotent (safe to run multiple times)
- Frontend changes should happen after backend is complete

