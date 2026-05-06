const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Product = require('./models/Product');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected for seeding'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

const seedData = async () => {
  try {
    // Clear existing
    await User.deleteMany();
    await Product.deleteMany();
    console.log('Cleared existing data.');

    // Users
    const plainPassword = 'demo123';

    const user1 = await User.create({
      name: 'Demo Seller',
      email: 'seller@demo.com',
      password: plainPassword,
      role: 'seller'
    });

    const user2 = await User.create({
      name: 'Demo User',
      email: 'user@demo.com',
      password: plainPassword,
      role: 'user'
    });

    // Also add the email from the user's screenshot
    await User.create({
      name: 'Pavan Mandapaka',
      email: 'pavansaimandapaka@gmail.com',
      password: plainPassword,
      role: 'user'
    });
    
    console.log('Created Users.');

    // Products
    const products = [
      {
        title: 'Sony WH-1000XM5 Wireless Headphones',
        description: 'Industry leading noise cancellation with two processors and eight microphones. Exceptional sound quality with newly developed DSEE Extreme.',
        price: 348.00,
        discountPrice: 298.00,
        category: 'Electronics',
        stock: 45,
        rating: 4.8,
        numReviews: 125,
        seller: user1._id,
        featured: true,
        images: [{ url: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&q=80', alt: 'Sony Headphones' }]
      },
      {
        title: 'Minimalist Mechanical Keyboard',
        description: 'Hot-swappable mechanical keyboard with RGB backlighting, Bluetooth 5.0, and PBT keycaps. Perfect for typing and gaming.',
        price: 129.99,
        category: 'Electronics',
        stock: 120,
        rating: 4.5,
        numReviews: 89,
        seller: user1._id,
        featured: true,
        images: [{ url: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&q=80', alt: 'Mechanical Keyboard' }]
      },
      {
        title: 'Ergonomic Office Chair',
        description: 'Premium mesh office chair with adjustable lumbar support, headrest, and 3D armrests. Designed for all-day comfort.',
        price: 249.50,
        category: 'Home & Garden',
        stock: 30,
        rating: 4.7,
        numReviews: 210,
        seller: user1._id,
        featured: false,
        images: [{ url: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=500&q=80', alt: 'Office Chair' }]
      },
      {
        title: 'Organic Cotton T-Shirt',
        description: '100% organic cotton, ethically sourced and sustainably made. Super soft and breathable for everyday wear.',
        price: 24.99,
        category: 'Clothing',
        stock: 200,
        rating: 4.9,
        numReviews: 54,
        seller: user1._id,
        featured: true,
        images: [{ url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80', alt: 'Cotton T-Shirt' }]
      },
      {
        title: 'Smart Fitness Watch',
        description: 'Track your heart rate, sleep, and workouts. Features a 1.4-inch AMOLED display and 14-day battery life.',
        price: 89.99,
        discountPrice: 79.99,
        category: 'Electronics',
        stock: 85,
        rating: 4.3,
        numReviews: 312,
        seller: user1._id,
        featured: false,
        images: [{ url: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&q=80', alt: 'Smart Watch' }]
      },
      {
        title: 'Ceramic Coffee Mug Set',
        description: 'Set of 4 artisan ceramic mugs. Dishwasher and microwave safe. Holds 12oz of your favorite beverage.',
        price: 34.50,
        category: 'Home & Garden',
        stock: 60,
        rating: 4.6,
        numReviews: 42,
        seller: user1._id,
        featured: false,
        images: [{ url: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500&q=80', alt: 'Coffee Mugs' }]
      }
    ];

    await Product.insertMany(products);
    console.log('Created Products.');

    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
