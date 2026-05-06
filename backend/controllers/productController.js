const Product = require('../models/Product');
const { cloudinary } = require('../config/cloudinary');

// @desc    Get all products with filtering, sorting, pagination
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      rating,
      sort = '-createdAt',
      page = 1,
      limit = 12,
      featured,
      seller,
    } = req.query;

    const query = { isActive: true };

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Rating filter
    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    // Featured filter
    if (featured === 'true') {
      query.featured = true;
    }

    // Seller filter
    if (seller) {
      query.seller = seller;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('seller', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Product.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'name email')
      .populate('reviews.user', 'name avatar');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private (Seller only)
exports.createProduct = async (req, res, next) => {
  try {
    const { title, description, price, discountPrice, category, stock, tags, featured } = req.body;

    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        images.push({ url: file.path, publicId: file.filename });
      }
    }

    if (images.length === 0) {
      images.push({
        url: 'https://via.placeholder.com/400x400?text=No+Image',
        publicId: '',
      });
    }

    const product = await Product.create({
      title,
      description,
      price: Number(price),
      discountPrice: Number(discountPrice) || 0,
      category,
      stock: Number(stock),
      seller: req.user.id,
      images,
      tags: tags ? tags.split(',').map((t) => t.trim()) : [],
      featured: featured === 'true',
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Seller only)
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this product' });
    }

    const updateData = { ...req.body };
    if (updateData.price) updateData.price = Number(updateData.price);
    if (updateData.stock) updateData.stock = Number(updateData.stock);
    if (updateData.tags) updateData.tags = updateData.tags.split(',').map((t) => t.trim());

    // Handle new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => ({ url: file.path, publicId: file.filename }));
      updateData.images = [...product.images, ...newImages];
    }

    product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Seller only)
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this product' });
    }

    // Delete images from Cloudinary
    for (const image of product.images) {
      if (image.publicId) {
        await cloudinary.uploader.destroy(image.publicId).catch(console.error);
      }
    }

    await product.deleteOne();
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add product review
// @route   POST /api/products/:id/reviews
// @access  Private
exports.addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if already reviewed
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user.id
    );
    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'You already reviewed this product' });
    }

    product.reviews.push({
      user: req.user.id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    });

    product.calculateRating();
    await product.save();

    res.status(201).json({ success: true, message: 'Review added', product });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product image
// @route   DELETE /api/products/:id/images/:imageId
// @access  Private (Seller only)
exports.deleteProductImage = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const image = product.images.id(req.params.imageId);
    if (image && image.publicId) {
      await cloudinary.uploader.destroy(image.publicId);
    }

    product.images = product.images.filter((img) => img._id.toString() !== req.params.imageId);
    await product.save();

    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};
