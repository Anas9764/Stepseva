const Category = require('../models/Category');
const Product = require('../models/Product');
const { categorySeeds, productSeeds } = require('../data/catalogSeedData');

const seedCatalog = async () => {
  const categoryMap = {};

  for (const category of categorySeeds) {
    const upserted = await Category.findOneAndUpdate(
      { name: category.name },
      category,
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );
    categoryMap[category.name] = upserted._id;
  }

  // Delete ALL products first to remove old Eclora products
  const deleteResult = await Product.deleteMany({});
  console.log(`   🗑️  Deleted ${deleteResult.deletedCount} old product(s)`);
  
  const categoryIds = Object.values(categoryMap);

  const preparedProducts = productSeeds
    .map(({ categoryName, sizeStock, ...product }) => {
      const categoryId = categoryMap[categoryName];
      if (!categoryId) {
        return null;
      }
      
      // Convert sizeStock object to Map if provided
      let sizeStockMap = new Map();
      if (sizeStock && typeof sizeStock === 'object') {
        Object.entries(sizeStock).forEach(([size, stock]) => {
          sizeStockMap.set(size, Number(stock));
        });
      }
      
      return {
        ...product,
        category: categoryId,
        image: product.images?.[0] || '',
        status: 'active',
        isActive: true,
        sizeStock: sizeStockMap.size > 0 ? sizeStockMap : undefined,
      };
    })
    .filter(Boolean);

  const products = await Product.insertMany(preparedProducts);

  return {
    categoriesSeeded: Object.keys(categoryMap).length,
    productsSeeded: products.length,
  };
};

module.exports = {
  seedCatalog,
};

