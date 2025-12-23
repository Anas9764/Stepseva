const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const BusinessAccount = require('./models/BusinessAccount');
const Lead = require('./models/Lead');
const Product = require('./models/Product');

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const createSampleUsersAndAccounts = async () => {
  // Create or find sample business users
  const sampleUsersData = [
    {
      name: 'Sharma Footwear Retail',
      email: 'retail@sharmafootwear.in',
      role: 'retailer',
    },
    {
      name: 'Kumar Wholesale Traders',
      email: 'sales@kumarwholesale.in',
      role: 'wholesaler',
    },
    {
      name: 'Metro Lifestyle Stores',
      email: 'b2b@metrolifestyle.in',
      role: 'business_customer',
    },
  ];

  const createdUsers = [];

  for (const userData of sampleUsersData) {
    let user = await User.findOne({ email: userData.email });
    if (!user) {
      user = new User({
        ...userData,
        password: 'Password@123', // will be hashed by pre-save hook
        isBusinessAccount: true,
      });
      await user.save();
      console.log(`👤 Created user: ${user.email}`);
    } else {
      console.log(`👤 Found existing user: ${user.email}`);
    }
    createdUsers.push(user);
  }

  // Optional: find an admin to assign as account manager
  const accountManager = await User.findOne({ role: 'admin' });

  const accounts = [];

  for (const user of createdUsers) {
    let account = await BusinessAccount.findOne({ userId: user._id });
    if (!account) {
      const base = {
        userId: user._id,
        companyName: user.name,
        businessType: user.role === 'wholesaler' ? 'wholesaler' : 'retailer',
        businessAddress: {
          street: 'Sample Street 123',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          country: 'India',
        },
        contactPerson: {
          name: user.name,
          email: user.email,
          phone: '+91-9999999999',
          designation: 'Owner',
        },
        pricingTier:
          user.role === 'wholesaler'
            ? 'wholesaler'
            : user.role === 'business_customer'
            ? 'retailer'
            : 'standard',
        paymentTerms:
          user.role === 'wholesaler' || user.role === 'business_customer'
            ? 'net30'
            : 'net15',
        creditLimit:
          user.role === 'wholesaler'
            ? 500000
            : user.role === 'business_customer'
            ? 300000
            : 100000,
        creditUsed: user.role === 'wholesaler' ? 120000 : 40000,
        status: 'active',
        requiresApproval: user.role !== 'retailer',
        approvalLimit: user.role === 'wholesaler' ? 100000 : 50000,
        isVerified: true,
      };

      if (accountManager) {
        base.accountManager = accountManager._id;
      }

      account = await BusinessAccount.create(base);
      console.log(`🏢 Created business account for: ${user.email}`);
    } else {
      console.log(`🏢 Found existing business account for: ${user.email}`);
    }

    // Link back to user
    user.businessAccountId = account._id;
    user.isBusinessAccount = true;
    await user.save();

    accounts.push(account);
  }

  return { users: createdUsers, accounts };
};

const createSampleLeads = async (accounts) => {
  const products = await Product.find({ bulkPricingEnabled: true }).limit(6);

  if (!products.length) {
    console.log(
      '⚠️ No B2B products found (bulkPricingEnabled: true). Please run seedB2BProducts.js first.'
    );
    return;
  }

  const statuses = [
    'new',
    'contacted',
    'interested',
    'quoted',
    'negotiating',
    'closed',
  ];

  const businessTypes = ['retailer', 'wholesaler', 'business_customer'];

  const leadsToInsert = [];

  accounts.forEach((account, accIndex) => {
    products.forEach((product, prodIndex) => {
      const quantity = 20 + accIndex * 10 + prodIndex * 5;
      const status = statuses[(accIndex + prodIndex) % statuses.length];
      const businessType =
        businessTypes[accIndex % businessTypes.length] || 'retailer';

      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - (accIndex * 3 + prodIndex));

      let followUpDate = null;
      let contactedAt = null;
      let quotedAt = null;
      
      if (['new', 'contacted', 'interested', 'quoted'].includes(status)) {
        followUpDate = new Date();
        followUpDate.setDate(followUpDate.getDate() + (prodIndex % 5) - 2);
      }
      
      if (['contacted', 'interested', 'quoted', 'negotiating', 'closed'].includes(status)) {
        contactedAt = new Date(createdAt);
        contactedAt.setHours(contactedAt.getHours() + 2);
      }
      
      if (['quoted', 'negotiating', 'closed'].includes(status)) {
        quotedAt = new Date(createdAt);
        quotedAt.setDate(quotedAt.getDate() + 1);
      }

      leadsToInsert.push({
        buyerName: `${account.companyName} Buyer ${prodIndex + 1}`,
        buyerEmail: `buyer${prodIndex + 1}@${account.companyName
          .toLowerCase()
          .replace(/\s+/g, '')}.in`,
        buyerPhone: `+91-98${accIndex}${prodIndex}00${prodIndex}0`,
        buyerCity: account.businessAddress?.city || 'Mumbai',
        buyerState: account.businessAddress?.state || 'Maharashtra',
        buyerCountry: account.businessAddress?.country || 'India',
        businessType,
        companyName: account.companyName,
        gstNumber: '27ABCDE1234F1Z' + accIndex,
        productId: product._id,
        productName: product.name,
        quantityRequired: quantity,
        size: '',
        color: product.variantColor || '',
        inquiryType: 'get_best_price',
        notes: `Sample inquiry for ${product.name} from ${account.companyName}`,
        requirements: 'Looking for best wholesale pricing and credit terms.',
        status,
        priority:
          quantity >= 500 ? 'urgent' : quantity >= 200 ? 'high' : 'medium',
        businessAccountId: account._id,
        source: 'website',
        followUpDate,
        contactedAt,
        quotedAt,
        quotedPrice: status === 'quoted' || status === 'negotiating' || status === 'closed' 
          ? Math.round(product.price * quantity * 0.85) 
          : undefined,
        quoteNotes: status === 'quoted' || status === 'negotiating' || status === 'closed'
          ? `Best price for ${quantity} units with ${account.pricingTier} tier discount.`
          : undefined,
        createdAt,
        updatedAt: createdAt,
      });
    });
  });

  if (!leadsToInsert.length) {
    console.log('⚠️ No leads prepared to insert.');
    return;
  }

  await Lead.insertMany(leadsToInsert);
  console.log(`📩 Inserted ${leadsToInsert.length} sample B2B leads.`);
};

const seedB2BLeadsAndAccounts = async () => {
  try {
    console.log('🚀 Starting B2B leads & accounts seeding...');
    if (!process.env.MONGO_URI) {
      console.error('❌ MONGO_URI is not set in .env');
      process.exit(1);
    }

    await connectDB();

    const { accounts } = await createSampleUsersAndAccounts();
    await createSampleLeads(accounts);

    console.log('✅ B2B leads & accounts seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding B2B leads & accounts:', error);
    process.exit(1);
  }
};

seedB2BLeadsAndAccounts();


