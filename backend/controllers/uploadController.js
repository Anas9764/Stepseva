const cloudinary = require('../utils/cloudinary');
const multer = require('multer');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  },
});

// Single file upload middleware
exports.uploadSingle = upload.single('image');

// @desc    Upload image to Cloudinary
// @route   POST /api/upload
// @access  Private/Admin
exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image',
      });
    }

    // Convert buffer to base64
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'eclora',
      resource_type: 'image',
    });

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      imageUrl: result.secure_url,
    });
  } catch (error) {
    console.error('Upload error:', error);
    next(error);
  }
};

