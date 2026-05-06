# ShopEase - Full Stack MERN E-Commerce Platform

ShopEase is a modern ecommerce platform built with the MERN stack (MongoDB, Express, React, Node.js). It features a sleek dark-themed UI, role-based access control, secure payments via Stripe, and a comprehensive seller dashboard.

## 🚀 Getting Started

Follow these steps to get the project running on your local machine.

### 1. Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (Local instance running on `localhost:27017` or a MongoDB Atlas URI)

### 2. Installation
Install dependencies for both the frontend and backend from the root directory:

```bash
npm install
npm run install:all
```

### 3. Environment Setup
Create a `.env` file in the `backend/` directory. You will need to provide your own API keys for Stripe and Cloudinary.

**`backend/.env` template:**
```env
PORT=5001
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb://127.0.0.1:27017/shopease

# JWT
JWT_SECRET=your_32_character_secret_key_here
JWT_EXPIRE=7d

# Stripe (Add your keys from stripe.com)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cloudinary (Add your keys from cloudinary.com)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Client Configuration
CLIENT_URL=http://localhost:3000

# Email (Nodemailer for Invoices)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 4. Seed Initial Data
To populate the database with demo products and accounts:

```bash
npm run seed
```
*Note: This will create demo accounts for testing (Password: `demo123`).*

### 5. Run the Application
Start both the backend and frontend concurrently:

```bash
npm run dev
```
The website will be available at [http://localhost:3000](http://localhost:3000).

---

## 🔑 Demo Accounts
| Role | Email | Password |
| :--- | :--- | :--- |
| **Shopper** | `user@demo.com` | `demo123` |
| **Seller** | `seller@demo.com` | `demo123` |

---

## ✨ Features
- **Modern UI:** Glassmorphism design with smooth animations.
- **Authentication:** Secure JWT-based auth with HTTP-only cookies.
- **Shopping Cart:** Persistent cart management.
- **Stripe Integration:** Secure checkout flow.
- **Seller Dashboard:** Full CRUD for products and order management.
- **Order Tracking:** Real-time order status updates and history.
- **JSP Invoices:** Automated professional invoice generation.

---

## 🛠️ Tech Stack
- **Frontend:** React, Vite, Axios, Context API, CSS Variables.
- **Backend:** Node.js, Express, Mongoose.
- **Database:** MongoDB.
- **Services:** Stripe (Payments), Cloudinary (Images), Nodemailer (Emails).
