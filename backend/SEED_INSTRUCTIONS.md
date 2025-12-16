# 🌱 StepSeva Database Seeding Instructions

## Prerequisites

1. ✅ MongoDB connection string in `.env` file
2. ✅ Cloudinary credentials in `.env` file (for future image uploads)
3. ✅ Backend dependencies installed (`npm install`)

## Quick Start

### Option 1: Seed Everything (Recommended)
This will seed categories, products, banners, and settings all at once:

```bash
cd backend
npm run seed:all
```

### Option 2: Seed Individually

**Seed Categories and Products:**
```bash
npm run seed
```

**Seed Banners:**
```bash
npm run seed:banners
```

## What Gets Seeded

### ✅ Categories (9 categories)
- Ladies Footwear
- Gents Footwear
- Kids Footwear
- Sneakers
- Casual Shoes
- Formal Shoes
- Sports Shoes
- Sandals
- Boots

### ✅ Products (12 products)
- 4 Ladies Footwear products
- 4 Gents Footwear products
- 3 Kids Footwear products
- 1 Unisex Sneakers product

Each product includes:
- Gender category (ladies, gents, kids, unisex)
- Footwear type (sneakers, casual, formal, sports, sandals, boots)
- Available sizes
- Size-specific stock (if provided)
- Images (using placeholder URLs)
- Pricing in INR

### ✅ Banners (4 banners)
- Main hero banner
- Ladies collection banner
- Gents collection banner
- Kids collection banner

### ✅ Settings
- Store name: StepSeva
- Store email: contact@stepseva.com
- Social media links (placeholders)
- Homepage content

## Environment Variables Required

Make sure your `.env` file has:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/stepseva
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Notes

- The seed script will **upsert** categories (won't duplicate)
- Products will be **deleted and recreated** for seeded categories
- Banners will be **deleted and recreated**
- Settings will be **upserted** (updated if exists, created if not)

## After Seeding

1. ✅ Check your MongoDB database - you should see:
   - 9 categories
   - 12 products
   - 4 banners
   - 1 settings document

2. ✅ Test the API:
   ```bash
   # Get all products
   GET http://localhost:5000/api/products
   
   # Get all categories
   GET http://localhost:5000/api/categories
   
   # Get active banners
   GET http://localhost:5000/api/banners/active
   ```

3. ✅ Create an admin user:
   ```bash
   npm run create-admin
   ```

## Troubleshooting

**Error: MongoDB connection failed**
- Check your `MONGO_URI` in `.env`
- Make sure MongoDB Atlas IP whitelist includes your IP (or 0.0.0.0/0 for development)

**Error: Validation error**
- Make sure all required fields are in the seed data
- Check that category names match between products and categories

**Products not showing sizes**
- The sizes are stored as an array in the product document
- Size-specific stock is stored as a Map (MongoDB will convert it)

## Next Steps

1. ✅ Run the seed script
2. ✅ Verify data in MongoDB
3. ✅ Update product images to your actual Cloudinary URLs
4. ✅ Create admin user
5. ✅ Test the frontend with seeded data

---

**Happy Seeding! 🌱👟**

