# Eclora Admin Panel

A fully functional admin panel for managing the Eclora eCommerce platform - a premium handmade candle and gifting online store.

## 🚀 Features

### Dashboard
- Real-time statistics (Total Revenue, Orders, Products, Users)
- Sales overview chart with ECharts
- Recent orders list
- Key performance metrics

### Products Management
- Complete CRUD operations
- Image upload via Cloudinary
- Product categorization
- Stock management
- Active/Inactive status toggle
- Search and filter functionality

### Categories Management
- Add, edit, and delete categories
- Category images
- Product count per category

### Orders Management
- View all customer orders
- Filter by order status (Pending, Processing, Shipped, Completed)
- Update order status
- Detailed order view with items and customer information

### Users Management
- View all registered users
- Role management (User/Admin)
- User statistics
- Delete users

### Banners Management
- Homepage banner management
- Image upload
- CTA configuration
- Priority ordering
- Active/Inactive status

### Coupons Management 🏷️
- Create discount codes
- Percentage or fixed amount discounts
- Minimum purchase requirements
- Expiry dates
- Usage limits
- Active/Inactive status

### Settings
- Store information configuration
- Social media links
- Homepage content
- Footer text

## 🛠️ Tech Stack

- **React.js** with Vite - Fast, modern build tool
- **Redux Toolkit** - State management
- **React Router DOM** - Navigation
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Axios** - API requests
- **React Hook Form** - Form handling
- **Yup** - Form validation
- **ECharts** - Data visualization
- **Lucide React** - Icons
- **React Hot Toast** - Notifications

## 📦 Installation

1. **Clone the repository**
```bash
cd admin-panel
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Configuration**

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:5000/api
```

For production, update with your backend URL:
```env
VITE_API_URL=https://your-backend-url.com/api
```

4. **Start the development server**
```bash
npm run dev
```

The admin panel will be available at `http://localhost:5173`

## 🔐 Authentication

The admin panel uses JWT-based authentication. Only users with `role: admin` can access the panel.

### Login Credentials
Use the credentials created in your backend. Ensure the user has admin role:
```json
{
  "email": "admin@eclora.com",
  "password": "your-password",
  "role": "admin"
}
```

## 📁 Project Structure

```
admin-panel/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Layout.jsx
│   │   ├── Loader.jsx
│   │   ├── Modal.jsx
│   │   ├── Navbar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── SearchInput.jsx
│   │   ├── Sidebar.jsx
│   │   └── Table.jsx
│   │
│   ├── pages/              # Page components
│   │   ├── Banners.jsx
│   │   ├── Categories.jsx
│   │   ├── Coupons.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Login.jsx
│   │   ├── Orders.jsx
│   │   ├── ProductForm.jsx
│   │   ├── Products.jsx
│   │   ├── Settings.jsx
│   │   └── Users.jsx
│   │
│   ├── services/           # API services
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── bannerService.js
│   │   ├── categoryService.js
│   │   ├── couponService.js
│   │   ├── dashboardService.js
│   │   ├── orderService.js
│   │   ├── productService.js
│   │   ├── settingsService.js
│   │   └── userService.js
│   │
│   ├── store/             # Redux store
│   │   ├── slices/
│   │   │   ├── authSlice.js
│   │   │   ├── bannerSlice.js
│   │   │   ├── categorySlice.js
│   │   │   ├── couponSlice.js
│   │   │   ├── dashboardSlice.js
│   │   │   ├── orderSlice.js
│   │   │   ├── productSlice.js
│   │   │   └── userSlice.js
│   │   └── index.js
│   │
│   ├── App.jsx            # Main app component
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
│
├── public/
├── .env                  # Environment variables
├── tailwind.config.js   # Tailwind configuration
├── vite.config.js       # Vite configuration
└── package.json
```

## 🎨 Design Theme

The admin panel follows Eclora's brand identity:

- **Primary Colors:**
  - Soft Pink: `#FADADD`
  - Lavender: `#B37BA4`
  - Neutral Background: `#FFF9F8`

- **Typography:** Inter font family
- **UI Style:** Clean, elegant, and premium

## 🔌 API Integration

All API requests are configured through the `api.js` service with:
- Automatic token injection
- Error handling
- Response interceptors
- Toast notifications

### Backend Requirements

Ensure your backend has the following endpoints:

**Authentication:**
- `POST /api/auth/login` - Admin login

**Products:**
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

**Categories:**
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

**Orders:**
- `GET /api/orders` - List orders
- `PUT /api/orders/:id` - Update order status

**Users:**
- `GET /api/users` - List users
- `PUT /api/users/:id/role` - Update user role
- `DELETE /api/users/:id` - Delete user

**Banners:**
- `GET /api/banners` - List banners
- `POST /api/banners` - Create banner
- `PUT /api/banners/:id` - Update banner
- `DELETE /api/banners/:id` - Delete banner

**Coupons:**
- `GET /api/coupons` - List coupons
- `POST /api/coupons` - Create coupon
- `PUT /api/coupons/:id` - Update coupon
- `DELETE /api/coupons/:id` - Delete coupon

**Dashboard:**
- `GET /api/dashboard/stats` - Get statistics
- `GET /api/dashboard/sales` - Get sales data
- `GET /api/dashboard/recent-orders` - Get recent orders

**Settings:**
- `GET /api/settings` - Get settings
- `PUT /api/settings` - Update settings

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist` folder.

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel --prod
```

3. Configure environment variables in Vercel dashboard:
```
VITE_API_URL=https://your-backend-url.com/api
```

### Deploy to Netlify

1. Build the project:
```bash
npm run build
```

2. Deploy the `dist` folder to Netlify

3. Set environment variables in Netlify dashboard

## 🔒 Security Features

- JWT token-based authentication
- Protected routes (admin-only access)
- Automatic token refresh
- Secure API communication
- CORS configuration

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🐛 Troubleshooting

### CORS Issues
Ensure your backend allows requests from the admin panel domain:
```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'https://your-admin-url.com'],
  credentials: true
}));
```

### Authentication Issues
- Check if the token is stored in localStorage
- Verify the user has admin role
- Ensure backend JWT secret matches

### Image Upload Issues
- Verify Cloudinary credentials in backend
- Check file size limits
- Ensure proper CORS settings

## 🤝 Contributing

This is a production admin panel for Eclora. For modifications or improvements:
1. Create a new branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

© 2024 Eclora. All rights reserved.

## 📞 Support

For issues or questions, contact the development team or open an issue in the repository.

---

Built with ❤️ for Eclora - Premium Handmade Candles & Gifting
