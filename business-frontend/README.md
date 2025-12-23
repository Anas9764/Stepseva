# Eclora Frontend

Modern eCommerce website for Eclora - Premium Handcrafted Candles & Gifting

## Tech Stack

- **React.js** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Redux Toolkit** - State management
- **React Router DOM** - Routing
- **Framer Motion** - Animations
- **Axios** - API requests
- **React Hook Form** - Form handling
- **Yup** - Validation
- **Stripe.js** - Payment integration

## Design System

### Color Palette
- **Primary:** `#FADADD` (soft blush pink)
- **Secondary:** `#1C1C1C` (deep charcoal)
- **Accent:** `#B37BA4` (lavender blush)
- **Background:** `#FFF9F8` (off-white)
- **Text:** `#2E2E2E`

### Typography
- **Headings:** Playfair Display (serif, elegant)
- **Body:** Poppins (clean sans-serif)

## Project Structure

```
frontend/
├── public/           # Static assets
├── src/
│   ├── components/   # Reusable components
│   ├── pages/        # Page components
│   ├── services/     # API services
│   ├── store/        # Redux store & slices
│   ├── App.jsx       # Main app component
│   └── main.jsx      # Entry point
├── index.html
├── tailwind.config.js
└── package.json
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### 3. Run Development Server

```bash
npm run dev
```

The app will run on `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

### 5. Preview Production Build

```bash
npm run preview
```

## Features

### Pages
- ✅ **Home** - Hero, featured products, categories, testimonials
- ✅ **Shop** - Product grid with filters and search
- ✅ **Product Details** - Image carousel, add to cart, related products
- ✅ **Cart** - View items, update quantities, proceed to checkout
- ✅ **Checkout** - Billing/shipping form, Stripe integration
- ✅ **Login/Register** - User authentication
- ✅ **About** - Brand story and values
- ✅ **Contact** - Contact form

### Components
- ✅ **Header** - Navigation, cart icon, user menu
- ✅ **Footer** - Links, social media, newsletter
- ✅ **ProductCard** - Reusable product display
- ✅ **Loader** - Loading states and skeletons

### State Management
- ✅ **Auth Slice** - User authentication state
- ✅ **Cart Slice** - Shopping cart management
- ✅ **Product Slice** - Product data and filters

### Features
- ✅ Responsive design (mobile-first)
- ✅ Smooth animations with Framer Motion
- ✅ Form validation with Yup
- ✅ JWT authentication
- ✅ Stripe payment integration
- ✅ Local storage persistence (cart, auth)

## Deployment

### Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Add environment variables in Vercel dashboard:
   - `VITE_API_URL`
   - `VITE_STRIPE_PUBLISHABLE_KEY`

### Netlify

1. Build the project:
```bash
npm run build
```

2. Deploy `dist` folder to Netlify

3. Add environment variables in Netlify dashboard

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Styling Guidelines

### Tailwind Classes
- Use utility-first approach
- Custom colors defined in `tailwind.config.js`
- Responsive design with `sm:`, `md:`, `lg:` prefixes

### Animations
- Framer Motion for page transitions
- Hover effects on interactive elements
- Smooth scroll behavior

## API Integration

All API calls are made through service files in `src/services/`:
- `api.js` - Axios instance with interceptors
- `authService.js` - Authentication endpoints
- `productService.js` - Product endpoints
- `orderService.js` - Order endpoints
- `paymentService.js` - Stripe integration
- `contactService.js` - Contact form

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Code splitting with React.lazy
- Image optimization
- Lazy loading
- Minified production builds

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to branch
5. Open a pull request

## License

MIT
