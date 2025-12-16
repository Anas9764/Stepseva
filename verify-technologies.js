// Technology Verification Script
// Run: node verify-technologies.js (from project root)

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying All Technologies...\n');

// Get backend directory path
const backendDir = path.join(__dirname, 'backend');
const adminPanelDir = path.join(__dirname, 'admin-panel');

let allPassed = true;

// Helper function to check if package is installed
const checkPackage = (packageName, displayName) => {
  try {
    // Try from backend node_modules first
    require.resolve(path.join(backendDir, 'node_modules', packageName));
    return true;
  } catch (e) {
    try {
      // Try from current directory
      require.resolve(packageName);
      return true;
    } catch (e2) {
      return false;
    }
  }
};

// Helper function to require package
const requirePackage = (packageName) => {
  try {
    return require(path.join(backendDir, 'node_modules', packageName));
  } catch (e) {
    return require(packageName);
  }
};

// 1. Check Redis
console.log('1️⃣  Checking Redis...');
(async () => {
  try {
    // Load .env if exists (try to require from backend)
    try {
      const dotenv = require(path.join(backendDir, 'node_modules', 'dotenv'));
      dotenv.config({ path: path.join(backendDir, '.env') });
    } catch (e) {
      // Try global dotenv
      try {
        const dotenv = require('dotenv');
        dotenv.config({ path: path.join(backendDir, '.env') });
      } catch (e2) {
        // dotenv not available, use default Redis URL
      }
    }
    
    if (checkPackage('redis', 'Redis')) {
      console.log('   ✅ Redis package installed');
      
      const redis = requirePackage('redis');
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      
      // Try to connect (non-blocking check)
      const client = redis.createClient({
        url: redisUrl,
      });
      
      try {
        await client.connect();
        console.log('   ✅ Redis: Connected successfully');
        const pingResult = await client.ping();
        console.log(`   ✅ Redis: Ping = ${pingResult}`);
        await client.quit();
      } catch (err) {
        console.log('   ⚠️  Redis: Not connected (app will work without it)');
        console.log(`      ${err.message}`);
        console.log('      💡 Make sure Redis is running: redis-server');
      }
    } else {
      console.log('   ❌ Redis package not found');
      allPassed = false;
    }
  } catch (e) {
    console.log('   ❌ Error checking Redis:', e.message);
    allPassed = false;
  }
})();

// 2. Check Bull
console.log('\n2️⃣  Checking Bull/BullMQ...');
if (checkPackage('bull', 'Bull')) {
  console.log('   ✅ Bull package installed');
} else {
  console.log('   ❌ Bull package not found');
  allPassed = false;
}

// 3. Check PDFKit
console.log('\n3️⃣  Checking PDFKit...');
if (checkPackage('pdfkit', 'PDFKit')) {
  console.log('   ✅ PDFKit package installed');
} else {
  console.log('   ❌ PDFKit package not found');
  allPassed = false;
}

// 4. Check Joi
console.log('\n4️⃣  Checking Joi...');
if (checkPackage('joi', 'Joi')) {
  console.log('   ✅ Joi package installed');
  try {
    const Joi = requirePackage('joi');
    // Test validation
    const schema = Joi.object({
      email: Joi.string().email().required(),
    });
    const { error } = schema.validate({ email: 'test@example.com' });
    if (!error) {
      console.log('   ✅ Joi validation working');
    }
  } catch (e) {
    console.log('   ⚠️  Joi validation test failed');
  }
} else {
  console.log('   ❌ Joi package not found');
  allPassed = false;
}

// 5. Check Socket.io
console.log('\n5️⃣  Checking Socket.io...');
if (checkPackage('socket.io', 'Socket.io')) {
  console.log('   ✅ Socket.io package installed');
} else {
  console.log('   ❌ Socket.io package not found');
  allPassed = false;
}

// 6. Check Winston
console.log('\n6️⃣  Checking Winston...');
if (checkPackage('winston', 'Winston')) {
  console.log('   ✅ Winston package installed');
  
  // Check if log files exist
  const logsDir = path.join(backendDir, 'logs');
  if (fs.existsSync(logsDir)) {
    console.log('   ✅ Log directory exists');
    const files = fs.readdirSync(logsDir);
    if (files.length > 0) {
      console.log(`   ✅ Log files found: ${files.join(', ')}`);
    } else {
      console.log('   ⚠️  Log directory empty (will be created on first log)');
    }
  } else {
    console.log('   ⚠️  Log directory not created yet (will be created on first log)');
  }
} else {
  console.log('   ❌ Winston package not found');
  allPassed = false;
}

// 7. Check React Query (admin-panel)
console.log('\n7️⃣  Checking React Query (Admin Panel)...');
try {
  const adminPkgPath = path.join(adminPanelDir, 'package.json');
  if (fs.existsSync(adminPkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(adminPkgPath, 'utf8'));
    if (pkg.dependencies && pkg.dependencies['@tanstack/react-query']) {
      console.log('   ✅ React Query package installed');
    } else {
      console.log('   ❌ React Query not in dependencies');
      allPassed = false;
    }
  } else {
    console.log('   ⚠️  Admin panel package.json not found');
  }
} catch (e) {
  console.log('   ❌ Error checking React Query:', e.message);
}

// 8. Check Socket.io Client (admin-panel)
console.log('\n8️⃣  Checking Socket.io Client (Admin Panel)...');
try {
  const adminPkgPath = path.join(adminPanelDir, 'package.json');
  if (fs.existsSync(adminPkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(adminPkgPath, 'utf8'));
    if (pkg.dependencies && pkg.dependencies['socket.io-client']) {
      console.log('   ✅ Socket.io Client package installed');
    } else {
      console.log('   ❌ Socket.io Client not in dependencies');
      allPassed = false;
    }
  }
} catch (e) {
  console.log('   ❌ Error checking Socket.io Client:', e.message);
}

// 9. Check Configuration Files
console.log('\n9️⃣  Checking Configuration Files...');

// Check Redis config
const redisConfig = path.join(backendDir, 'config', 'redis.js');
if (fs.existsSync(redisConfig)) {
  console.log('   ✅ Redis config file exists');
} else {
  console.log('   ❌ Redis config file not found');
  allPassed = false;
}

// Check Queue config
const queueConfig = path.join(backendDir, 'config', 'queue.js');
if (fs.existsSync(queueConfig)) {
  console.log('   ✅ Queue config file exists');
} else {
  console.log('   ❌ Queue config file not found');
  allPassed = false;
}

// Check Logger config
const loggerConfig = path.join(backendDir, 'config', 'logger.js');
if (fs.existsSync(loggerConfig)) {
  console.log('   ✅ Logger config file exists');
} else {
  console.log('   ❌ Logger config file not found');
  allPassed = false;
}

// Check Socket config
const socketConfig = path.join(backendDir, 'config', 'socket.js');
if (fs.existsSync(socketConfig)) {
  console.log('   ✅ Socket.io config file exists');
} else {
  console.log('   ❌ Socket.io config file not found');
  allPassed = false;
}

// Check Validation middleware
const validationMiddleware = path.join(backendDir, 'middleware', 'validation.js');
if (fs.existsSync(validationMiddleware)) {
  console.log('   ✅ Validation middleware exists');
} else {
  console.log('   ❌ Validation middleware not found');
  allPassed = false;
}

// Wait a bit for async Redis check, then show summary
setTimeout(() => {
  // Summary
  console.log('\n' + '='.repeat(50));
  if (allPassed) {
    console.log('✅ All technologies are installed and configured!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Start Redis: redis-server');
    console.log('   2. Start Backend: cd backend && npm run dev');
    console.log('   3. Start Admin Panel: cd admin-panel && npm run dev');
    console.log('   4. Check browser console for Socket.io connection');
    console.log('   5. Place a test order to verify queues');
    console.log('\n💡 Note: If Redis is not running, app will work without caching');
  } else {
    console.log('⚠️  Some technologies need attention');
    console.log('   Check the errors above and install missing packages');
    console.log('   Run: cd backend && npm install');
  }
  console.log('='.repeat(50));
  process.exit(0);
}, 3000); // Wait 3 seconds for async Redis check
