# Eclora Backend API

Backend API for Eclora eCommerce platform - Handcrafted Candles & Gifting

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database (Atlas)
- **Mongoose** - ODM
- **JWT** - Authentication
- **Stripe** - Payment processing
- **Cloudinary** - Image hosting
- **Nodemailer** - Email service
- **Helmet** - Security
- **Bcryptjs** - Password hashing

## Project Structure

```
backend/
├── controllers/       # Route controllers
├── middleware/        # Custom middleware
├── models/           # Database models
├── routes/           # API routes
├── utils/            # Utility functions
├── .env.example      # Environment variables template
├── index.js          # Entry point
└── package.json      # Dependencies
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the backend directory and add:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/eclora
JWT_SECRET=your_jwt_secret_key_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 3. MongoDB Setup

1. Create a free account on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Add it to your `.env` file

### 4. Cloudinary Setup

1. Create a free account on [Cloudinary](https://cloudinary.com)
2. Get your credentials from the dashboard
3. Add them to your `.env` file

### 5. Stripe Setup

1. Create a [Stripe](https://stripe.com) account
2. Get your test API keys
3. Add them to your `.env` file

### 6. Run the Server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/:userId` - Get user orders (Protected)
- `GET /api/orders` - Get all orders (Admin only)
- `PUT /api/orders/:id` - Update order status (Admin only)

### Payment
- `POST /api/create-checkout-session` - Create Stripe checkout session
- `POST /api/webhook` - Stripe webhook handler

### Contact
- `POST /api/contact` - Send contact email

## API Response Format

All API responses follow this format:

```json
{
  "success": true,
  "message": "Success message",
  "data": {}
}
```

## Error Handling

Errors are handled globally and return:

```json
{
  "success": false,
  "message": "Error message"
}
```

## Deployment

### Render / Railway

1. Push code to GitHub
2. Connect your repository
3. Add environment variables
4. Deploy

### Environment Variables for Production

Make sure to set all environment variables in your deployment platform:
- `MONGO_URI`
- `JWT_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `STRIPE_SECRET_KEY`
- `CLIENT_URL` (your frontend URL)
- `NODE_ENV=production`

## Testing

Use Postman or Thunder Client to test API endpoints:

1. Import the API collection
2. Set up environment variables
3. Test each endpoint

## Security Features

- Helmet.js for security headers
- CORS configured
- JWT token authentication
- Password hashing with bcryptjs
- Input validation
- Error handling middleware

## License

MIT

