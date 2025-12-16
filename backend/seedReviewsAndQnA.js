const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Review = require('./models/Review');
const Question = require('./models/Question');
const Product = require('./models/Product');
const User = require('./models/User');

dotenv.config();

// Sample review data
const sampleReviews = [
  {
    rating: 5,
    title: 'Excellent Quality!',
    comment: 'Amazing product! The quality is outstanding and it fits perfectly. Highly recommended!',
    images: [],
  },
  {
    rating: 5,
    title: 'Love it!',
    comment: 'Very comfortable and stylish. Great value for money. Will definitely buy again.',
    images: [],
  },
  {
    rating: 4,
    title: 'Good Product',
    comment: 'Nice quality and comfortable. The only issue is the color is slightly different from the image, but overall satisfied.',
    images: [],
  },
  {
    rating: 4,
    title: 'Worth the Price',
    comment: 'Good quality footwear. Comfortable for daily use. Delivery was fast and packaging was good.',
    images: [],
  },
  {
    rating: 5,
    title: 'Perfect Fit!',
    comment: 'Exactly as described. The size fits perfectly and the material is of good quality. Very happy with my purchase!',
    images: [],
  },
  {
    rating: 3,
    title: 'Average Quality',
    comment: 'The product is okay but not exceptional. The quality is decent for the price. Could be better.',
    images: [],
  },
  {
    rating: 5,
    title: 'Super Comfortable',
    comment: 'Extremely comfortable to wear. Perfect for long walks. The cushioning is excellent. Highly recommend!',
    images: [],
  },
  {
    rating: 4,
    title: 'Nice Design',
    comment: 'Beautiful design and good quality. The only minor issue is that it took a few days to break in, but now it\'s very comfortable.',
    images: [],
  },
  {
    rating: 2,
    title: 'Not as Expected',
    comment: 'The product quality is not what I expected. The material feels cheap and it started showing wear after just a few uses.',
    images: [],
  },
  {
    rating: 5,
    title: 'Best Purchase Ever!',
    comment: 'Absolutely love this product! The quality is premium and it looks even better in person. Fast shipping too!',
    images: [],
  },
  {
    rating: 4,
    title: 'Great Value',
    comment: 'Good quality product at a reasonable price. Comfortable and durable. Would recommend to others.',
    images: [],
  },
  {
    rating: 5,
    title: 'Exceeded Expectations',
    comment: 'The product exceeded my expectations. Great quality, perfect fit, and excellent customer service. 5 stars!',
    images: [],
  },
  {
    rating: 3,
    title: 'Okay Product',
    comment: 'It\'s an okay product. Nothing special but does the job. The quality is average for the price point.',
    images: [],
  },
  {
    rating: 4,
    title: 'Comfortable and Stylish',
    comment: 'Very comfortable to wear and looks stylish. Good quality material. Happy with the purchase.',
    images: [],
  },
  {
    rating: 5,
    title: 'Perfect!',
    comment: 'Perfect product! Great quality, perfect fit, and fast delivery. Will definitely order again!',
    images: [],
  },
];

// Sample questions
const sampleQuestions = [
  {
    question: 'Is this product true to size?',
    answers: [
      {
        answer: 'Yes, it fits true to size. I ordered my regular size and it fits perfectly.',
        isAdmin: false,
      },
      {
        answer: 'Yes, the sizing is accurate. I recommend ordering your usual size.',
        isAdmin: true,
      },
    ],
  },
  {
    question: 'What is the material quality like?',
    answers: [
      {
        answer: 'The material quality is excellent. It feels durable and well-made.',
        isAdmin: false,
      },
      {
        answer: 'Our products are made with high-quality materials to ensure durability and comfort.',
        isAdmin: true,
      },
    ],
  },
  {
    question: 'Is this suitable for daily wear?',
    answers: [
      {
        answer: 'Yes, absolutely! I wear it daily and it\'s very comfortable.',
        isAdmin: false,
      },
    ],
  },
  {
    question: 'How long does shipping take?',
    answers: [
      {
        answer: 'I received my order within 3-4 days. Fast delivery!',
        isAdmin: false,
      },
      {
        answer: 'Standard shipping takes 3-5 business days. Express shipping options are also available.',
        isAdmin: true,
      },
    ],
  },
  {
    question: 'Can I return this if it doesn\'t fit?',
    answers: [
      {
        answer: 'Yes, they have a good return policy. I returned a pair that didn\'t fit and got a refund quickly.',
        isAdmin: false,
      },
      {
        answer: 'Yes, we offer a 7-day return policy. If the product doesn\'t fit or you\'re not satisfied, you can return it for a full refund.',
        isAdmin: true,
      },
    ],
  },
  {
    question: 'Is this waterproof?',
    answers: [
      {
        answer: 'No, this is not waterproof. It\'s suitable for normal weather conditions.',
        isAdmin: false,
      },
    ],
  },
  {
    question: 'What colors are available?',
    answers: [
      {
        answer: 'Check the product page for available color variants. There are usually 3-4 color options.',
        isAdmin: false,
      },
      {
        answer: 'We offer multiple color variants for this product. Please check the "More Colors" section on the product page to see all available options.',
        isAdmin: true,
      },
    ],
  },
  {
    question: 'Is this suitable for running?',
    answers: [
      {
        answer: 'This is more suitable for casual wear. For running, I\'d recommend looking at sports-specific footwear.',
        isAdmin: false,
      },
    ],
  },
  {
    question: 'How do I care for this product?',
    answers: [
      {
        answer: 'I clean it with a damp cloth and let it air dry. Works well!',
        isAdmin: false,
      },
      {
        answer: 'We recommend cleaning with a soft damp cloth and air drying. Avoid machine washing to maintain the product quality.',
        isAdmin: true,
      },
    ],
  },
  {
    question: 'Does this come with a warranty?',
    answers: [
      {
        answer: 'Yes, there\'s a warranty. Check the product details for warranty information.',
        isAdmin: false,
      },
      {
        answer: 'Yes, all our products come with a manufacturer warranty. Please refer to the warranty card included with your purchase for details.',
        isAdmin: true,
      },
    ],
  },
];

const seedReviewsAndQnA = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    // Get all products
    const products = await Product.find({ isActive: true }).limit(20);
    if (products.length === 0) {
      console.log('❌ No products found. Please seed products first.');
      process.exit(1);
    }

    // Get all users (create a test user if none exists)
    let users = await User.find();
    if (users.length === 0) {
      console.log('⚠️  No users found. Creating test users...');
      const testUsers = [
        {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
          role: 'user',
        },
        {
          name: 'Jane Smith',
          email: 'jane@example.com',
          password: 'password123',
          role: 'user',
        },
        {
          name: 'Mike Johnson',
          email: 'mike@example.com',
          password: 'password123',
          role: 'user',
        },
        {
          name: 'Sarah Williams',
          email: 'sarah@example.com',
          password: 'password123',
          role: 'user',
        },
        {
          name: 'David Brown',
          email: 'david@example.com',
          password: 'password123',
          role: 'user',
        },
      ];

      for (const userData of testUsers) {
        const user = new User(userData);
        await user.save();
      }
      users = await User.find();
      console.log(`✅ Created ${users.length} test users`);
    }

    // Get admin user
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('⚠️  No admin user found. Some answers will not have admin badge.');
    }

    console.log(`\n📝 Seeding Reviews and Q&A for ${products.length} products...\n`);

    let totalReviews = 0;
    let totalQuestions = 0;
    let totalAnswers = 0;

    // Add reviews and Q&A for each product
    for (const product of products) {
      // Add reviews (2-5 reviews per product)
      const numReviews = Math.floor(Math.random() * 4) + 2;
      const shuffledReviews = [...sampleReviews].sort(() => 0.5 - Math.random());
      
      for (let i = 0; i < numReviews && i < shuffledReviews.length; i++) {
        const reviewData = shuffledReviews[i];
        const randomUser = users[Math.floor(Math.random() * users.length)];
        
        // Check if user already reviewed this product
        const existingReview = await Review.findOne({
          product: product._id,
          user: randomUser._id,
        });

        if (!existingReview) {
          // Randomly mark some as verified purchase (30% chance)
          const verifiedPurchase = Math.random() < 0.3;
          
          // Random helpful votes (0-10)
          const helpful = Math.floor(Math.random() * 11);

          const review = await Review.create({
            product: product._id,
            user: randomUser._id,
            rating: reviewData.rating,
            title: reviewData.title,
            comment: reviewData.comment,
            images: reviewData.images,
            verifiedPurchase,
            helpful,
            isApproved: true,
            isActive: true,
          });

          totalReviews++;
        }
      }

      // Add questions (1-3 questions per product)
      const numQuestions = Math.floor(Math.random() * 3) + 1;
      const shuffledQuestions = [...sampleQuestions].sort(() => 0.5 - Math.random());
      
      for (let i = 0; i < numQuestions && i < shuffledQuestions.length; i++) {
        const questionData = shuffledQuestions[i];
        const randomUser = users[Math.floor(Math.random() * users.length)];
        
        // Check if user already asked this question for this product
        const existingQuestion = await Question.findOne({
          product: product._id,
          user: randomUser._id,
          question: questionData.question,
        });

        if (!existingQuestion) {
          const question = await Question.create({
            product: product._id,
            user: randomUser._id,
            question: questionData.question,
            isActive: true,
          });

          totalQuestions++;

          // Add answers to the question
          for (const answerData of questionData.answers) {
            let answerUser;
            if (answerData.isAdmin && adminUser) {
              answerUser = adminUser;
            } else {
              // Use a different random user for customer answers
              const otherUsers = users.filter(u => u._id.toString() !== randomUser._id.toString());
              answerUser = otherUsers[Math.floor(Math.random() * otherUsers.length)] || randomUser;
            }

            question.answers.push({
              answer: answerData.answer,
              answeredBy: answerUser._id,
              isAdmin: answerData.isAdmin,
              helpful: Math.floor(Math.random() * 8), // Random helpful votes (0-7)
              isActive: true,
            });

            totalAnswers++;
          }

          await question.save();
        }
      }

      console.log(`✅ Added reviews and Q&A for: ${product.name}`);
    }

    console.log(`\n🎉 Seeding completed successfully!`);
    console.log(`📊 Statistics:`);
    console.log(`   - Total Reviews: ${totalReviews}`);
    console.log(`   - Total Questions: ${totalQuestions}`);
    console.log(`   - Total Answers: ${totalAnswers}`);
    console.log(`   - Products Updated: ${products.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding reviews and Q&A:', error);
    process.exit(1);
  }
};

// Run the seeder
seedReviewsAndQnA();

