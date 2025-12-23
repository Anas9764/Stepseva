const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const BusinessAccount = require('./models/BusinessAccount');

// Load environment variables
dotenv.config();

const createB2BUser = async () => {
  try {
    // Connect to MongoDB
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
    console.log('-----------------------------------');

    // Default B2B user credentials (you can modify these)
    const defaultEmail = 'b2b@stepseva.com';
    const defaultName = 'B2B Test User';
    const defaultPassword = 'b2b123';
    const defaultCompanyName = 'Test Retail Store';
    const defaultBusinessType = 'retailer'; // 'retailer', 'wholesaler', or 'business_customer'
    const defaultCreditLimit = 100000; // ₹1,00,000
    const defaultPaymentTerms = 'net30'; // 'net15', 'net30', 'net45', 'net60'
    const defaultPricingTier = 'retailer'; // 'standard', 'retailer', 'wholesaler', 'premium'

    // Get credentials from command line arguments or use defaults
    const email = process.argv[2] || defaultEmail;
    const name = process.argv[3] || defaultName;
    const password = process.argv[4] || defaultPassword;
    const companyName = process.argv[5] || defaultCompanyName;
    const businessType = process.argv[6] || defaultBusinessType;
    const creditLimit = process.argv[7] ? parseInt(process.argv[7]) : defaultCreditLimit;
    const paymentTerms = process.argv[8] || defaultPaymentTerms;
    const pricingTier = process.argv[9] || defaultPricingTier;

    // Validate business type
    const validBusinessTypes = ['retailer', 'wholesaler', 'business_customer'];
    if (!validBusinessTypes.includes(businessType)) {
      console.error('❌ Invalid business type. Must be one of:', validBusinessTypes.join(', '));
      await mongoose.connection.close();
      process.exit(1);
    }

    // Validate payment terms
    const validPaymentTerms = ['net15', 'net30', 'net45', 'net60', 'cod', 'prepaid'];
    if (!validPaymentTerms.includes(paymentTerms)) {
      console.error('❌ Invalid payment terms. Must be one of:', validPaymentTerms.join(', '));
      await mongoose.connection.close();
      process.exit(1);
    }

    // Validate pricing tier
    const validPricingTiers = ['standard', 'retailer', 'wholesaler', 'premium'];
    if (!validPricingTiers.includes(pricingTier)) {
      console.error('❌ Invalid pricing tier. Must be one of:', validPricingTiers.join(', '));
      await mongoose.connection.close();
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      console.log('ℹ️  User already exists with this email!');
      
      // Check if user already has a business account
      if (existingUser.isBusinessAccount && existingUser.businessAccountId) {
        const existingAccount = await BusinessAccount.findById(existingUser.businessAccountId);
        if (existingAccount) {
          console.log('-----------------------------------');
          console.log('📧 Email:', existingUser.email);
          console.log('👤 Name:', existingUser.name);
          console.log('🏢 Company:', existingAccount.companyName);
          console.log('📊 Business Type:', existingAccount.businessType);
          console.log('💳 Credit Limit: ₹' + existingAccount.creditLimit.toLocaleString('en-IN'));
          console.log('💵 Credit Available: ₹' + (existingAccount.creditLimit - existingAccount.creditUsed).toLocaleString('en-IN'));
          console.log('📋 Payment Terms:', existingAccount.paymentTerms);
          console.log('🏷️  Pricing Tier:', existingAccount.pricingTier);
          console.log('✅ Status:', existingAccount.status);
          console.log('-----------------------------------');
          console.log('✨ User already has a business account!');
          console.log('-----------------------------------');
          
          await mongoose.connection.close();
          process.exit(0);
        }
      }
      
      // User exists but no business account - create one
      console.log('🔄 Creating business account for existing user...');
      
      const businessAccount = await BusinessAccount.create({
        userId: existingUser._id,
        businessType: businessType,
        companyName: companyName,
        businessAddress: {
          street: '123 Business Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          country: 'India',
        },
        contactPerson: {
          name: name,
          email: email.toLowerCase(),
          phone: '+91 9876543210',
          designation: 'Owner',
        },
        creditLimit: creditLimit,
        creditUsed: 0,
        creditAvailable: creditLimit,
        paymentTerms: paymentTerms,
        pricingTier: pricingTier,
        status: 'active', // Set to active for testing
        isVerified: true,
        verifiedAt: new Date(),
      });

      // Update user
      await User.findByIdAndUpdate(existingUser._id, {
        isBusinessAccount: true,
        businessAccountId: businessAccount._id,
        role: businessType,
      });

      console.log('✅ Business account created successfully!');
      console.log('-----------------------------------');
      console.log('📧 Email:', existingUser.email);
      console.log('👤 Name:', existingUser.name);
      console.log('🏢 Company:', businessAccount.companyName);
      console.log('📊 Business Type:', businessAccount.businessType);
      console.log('💳 Credit Limit: ₹' + businessAccount.creditLimit.toLocaleString('en-IN'));
      console.log('💵 Credit Available: ₹' + businessAccount.creditAvailable.toLocaleString('en-IN'));
      console.log('📋 Payment Terms:', businessAccount.paymentTerms);
      console.log('🏷️  Pricing Tier:', businessAccount.pricingTier);
      console.log('✅ Status:', businessAccount.status);
      console.log('🔒 Password:', password);
      console.log('-----------------------------------');
      console.log('✨ You can now login to the Business Frontend with these credentials');
      console.log('-----------------------------------');
      
      await mongoose.connection.close();
      process.exit(0);
    }

    // Create new user
    console.log('🔄 Creating new B2B user...');
    
    const user = await User.create({
      name: name,
      email: email.toLowerCase(),
      password: password, // This will be automatically hashed by the User model
      role: businessType, // Set role based on business type
      isBusinessAccount: false, // Will be updated after business account creation
    });

    console.log('✅ User created successfully!');
    console.log('🔄 Creating business account...');

    // Create business account
    const businessAccount = await BusinessAccount.create({
      userId: user._id,
      businessType: businessType,
      companyName: companyName,
      businessRegistrationNumber: `BRN${Date.now()}`,
      taxId: `TAX${Date.now()}`,
      businessAddress: {
        street: '123 Business Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        country: 'India',
      },
      contactPerson: {
        name: name,
        email: email.toLowerCase(),
        phone: '+91 9876543210',
        designation: 'Owner',
      },
      creditLimit: creditLimit,
      creditUsed: 0,
      creditAvailable: creditLimit,
      paymentTerms: paymentTerms,
      pricingTier: pricingTier,
      status: 'active', // Set to active for testing (normally would be 'pending')
      isVerified: true,
      verifiedAt: new Date(),
    });

    // Update user to link business account
    await User.findByIdAndUpdate(user._id, {
      isBusinessAccount: true,
      businessAccountId: businessAccount._id,
    });

    console.log('✅ Business account created successfully!');
    console.log('-----------------------------------');
    console.log('📧 Email:', user.email);
    console.log('👤 Name:', user.name);
    console.log('🔑 Role:', user.role);
    console.log('🏢 Company:', businessAccount.companyName);
    console.log('📊 Business Type:', businessAccount.businessType);
    console.log('💳 Credit Limit: ₹' + businessAccount.creditLimit.toLocaleString('en-IN'));
    console.log('💵 Credit Available: ₹' + businessAccount.creditAvailable.toLocaleString('en-IN'));
    console.log('📋 Payment Terms:', businessAccount.paymentTerms);
    console.log('🏷️  Pricing Tier:', businessAccount.pricingTier);
    console.log('✅ Status:', businessAccount.status);
    console.log('🔒 Password:', password);
    console.log('-----------------------------------');
    console.log('✨ You can now login to the Business Frontend with these credentials');
    console.log('-----------------------------------');
    console.log('💡 Usage: node createB2BUser.js [email] [name] [password] [companyName] [businessType] [creditLimit] [paymentTerms] [pricingTier]');
    console.log('   Example: node createB2BUser.js retailer@test.com "Retail Store" pass123 "My Retail Store" retailer 50000 net30 retailer');
    console.log('-----------------------------------');
    console.log('📋 Default Values:');
    console.log('   Email: b2b@stepseva.com');
    console.log('   Name: B2B Test User');
    console.log('   Password: b2b123');
    console.log('   Company: Test Retail Store');
    console.log('   Business Type: retailer');
    console.log('   Credit Limit: ₹1,00,000');
    console.log('   Payment Terms: net30');
    console.log('   Pricing Tier: retailer');
    console.log('-----------------------------------');

    await mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error creating B2B user:', error.message);
    
    if (error.code === 11000) {
      console.log('-----------------------------------');
      console.log('ℹ️  This error means the email or business account already exists.');
      console.log('💡 Try using a different email or delete the existing user/account.');
      console.log('-----------------------------------');
    }
    
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the script
console.log('');
console.log('==========================================');
console.log('   STEPSEVA B2B USER CREATION SCRIPT      ');
console.log('==========================================');
console.log('');

createB2BUser();

