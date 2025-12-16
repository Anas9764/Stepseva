const { seedCatalog } = require('../services/catalogSeeder');

exports.seedCatalogData = async (req, res, next) => {
  try {
    const result = await seedCatalog();
    res.status(200).json({
      success: true,
      message: 'Catalog data synced successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

