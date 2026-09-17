# 🌍 EcoCycleHUB

<div align="center">
  
  ![EcoCycleHUB Banner](https://via.placeholder.com/1200x300/00b894/ffffff?text=EcoCycleHUB+-+Sustainable+E-Waste+Management+Platform)
  
  **A comprehensive e-waste management and recycling platform with AI-powered price prediction**
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
  [![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-20.x-brightgreen.svg)](https://nodejs.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-7.x-green.svg)](https://www.mongodb.com/)
  [![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://www.python.org/)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Screenshots](#-screenshots)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [ML Model](#-ml-model)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**EcoCycleHUB** is a full-stack e-waste management platform that connects users, recycling centers, sellers, and buyers in a sustainable ecosystem. The platform features AI-powered price prediction for electronics, a rewards system for recycling, and multiple portals for different user roles.

### 🎯 Mission

To create a sustainable future by making e-waste recycling easy, rewarding, and accessible to everyone while promoting the circular economy.

---

## ✨ Features

### 👥 User Portal
- 🔐 **Authentication System** - Secure login/signup with JWT and Firebase
- 🛒 **E-Commerce Platform** - Buy refurbished electronics
- ♻️ **Recycle Submission** - Submit e-waste for recycling with image upload
- 🎁 **Rewards System** - Earn eco-points for recycling activities
- 📜 **Certificates & Badges** - Get recognition for your contributions
- 📍 **Nearby Centers** - Find recycling centers with interactive maps
- 🌓 **Dark/Light Theme** - Comfortable viewing experience
- 📱 **Responsive Design** - Works seamlessly on all devices

### 💼 Seller Portal
- ➕ **Product Management** - Add and manage recycled products
- 📦 **Order Tracking** - Track orders and shipments
- 📊 **Dashboard** - View sales analytics
- 🤖 **AI Price Prediction** - Get price suggestions using ML model

### 👨‍💼 Admin Portal
- 👥 **User Management** - Manage users and permissions
- ✅ **Seller KYC Verification** - Approve seller applications
- 📦 **Order Management** - Oversee all platform orders
- 📈 **Analytics Dashboard** - Platform-wide insights

### 🛍️ Buyer Portal
- 🔍 **Product Search** - Advanced search and filters
- 🛒 **Shopping Cart** - Seamless checkout experience
- 💳 **Multiple Payment Options** - COD, Stripe, Razorpay
- 📱 **Order Tracking** - Real-time order status

### 🤖 ML Features
- 💰 **Price Prediction** - AI-powered pricing for electronics
- 📊 **Data Analysis** - Product condition assessment
- 🎯 **Smart Recommendations** - Personalized product suggestions

---

## 📸 Screenshots

### Home Page
![Home Page Light](https://via.placeholder.com/800x450/ffffff/00b894?text=Home+Page+-+Light+Mode)
![Home Page Dark](https://via.placeholder.com/800x450/1a1a1a/00b894?text=Home+Page+-+Dark+Mode)

### User Dashboard
![User Dashboard](https://via.placeholder.com/800x450/ffffff/00b894?text=User+Dashboard+with+Eco+Points)

### Recycle Submission
![Recycle Submission](https://via.placeholder.com/800x450/ffffff/00b894?text=Submit+E-Waste+for+Recycling)

### Rewards & Badges
![Rewards System](https://via.placeholder.com/800x450/ffffff/00b894?text=Rewards+and+Leaderboard)

### Seller Dashboard
![Seller Dashboard](https://via.placeholder.com/800x450/ffffff/00b894?text=Seller+Portal+with+ML+Predictions)

### Admin Panel
![Admin Panel](https://via.placeholder.com/800x450/ffffff/00b894?text=Admin+Management+Dashboard)

### Mobile Responsive
<div align="center">
  <img src="https://via.placeholder.com/300x600/ffffff/00b894?text=Mobile+View" alt="Mobile View" width="250"/>
</div>

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18.3.1 with Vite
- **Routing:** React Router DOM v7
- **Styling:** Tailwind CSS 3.x
- **Icons:** Lucide React
- **Maps:** Leaflet & React Leaflet
- **Notifications:** React Toastify
- **Authentication:** Firebase Auth
- **State Management:** Context API
- **HTTP Client:** Axios

### Backend
- **Runtime:** Node.js 20.x
- **Framework:** Express.js 4.x
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (jsonwebtoken)
- **File Upload:** Multer + Cloudinary
- **Security:** bcrypt, CORS
- **Validation:** Express Validator
- **Payment:** Stripe, Razorpay

### Machine Learning
- **Language:** Python 3.11+
- **Framework:** FastAPI
- **ML Libraries:** scikit-learn, pandas, numpy
- **Model:** Random Forest Regressor
- **Data Processing:** pandas, joblib
- **API:** uvicorn (ASGI server)

### DevOps & Tools
- **Version Control:** Git
- **Hosting:** Vercel (Frontend), Vercel (Backend)
- **Database Hosting:** MongoDB Atlas
- **Media Storage:** Cloudinary
- **Environment:** dotenv

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                             │
│  ┌──────────┬──────────┬──────────┬──────────┐             │
│  │  User    │  Seller  │  Admin   │  Buyer   │             │
│  │  Portal  │  Portal  │  Portal  │  Portal  │             │
│  └─────┬────┴────┬─────┴────┬─────┴────┬─────┘             │
└────────┼─────────┼──────────┼──────────┼───────────────────┘
         │         │          │          │
         └─────────┴──────────┴──────────┘
                     │
         ┌───────────▼────────────┐
         │   React Frontend       │
         │   (Vite + Tailwind)    │
         └───────────┬────────────┘
                     │
         ┌───────────▼────────────┐
         │   Express Backend      │
         │   (REST API)           │
         └─────┬──────────┬───────┘
               │          │
      ┌────────▼───┐   ┌──▼──────────┐
      │  MongoDB   │   │  ML API     │
      │  Database  │   │  (FastAPI)  │
      └────────────┘   └─────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x or higher
- MongoDB 7.x or higher
- Python 3.11+ (for ML model)
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/EcoCycleHUB.git
cd EcoCycleHUB
```

2. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configurations
npm run server
```

3. **Setup Frontend**
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your configurations
npm run dev
```

4. **Setup ML Model (Optional)**
```bash
cd ml_model
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python ml_api.py
```

### Quick Start Scripts

**Backend Server:**
```bash
cd backend
npm run server  # Starts on port 4000
```

**Frontend Development:**
```bash
cd frontend
npm run dev  # Starts on port 5173
```

**ML API:**
```bash
cd ml_model
uvicorn ml_api:app --reload --port 8000
```

---

## 📁 Project Structure

```
EcoCycleHUB/
├── 📂 backend/                 # Node.js/Express backend
│   ├── 📂 config/             # Configuration files
│   │   ├── cloudinary.js      # Cloudinary setup
│   │   └── mongodb.js         # MongoDB connection
│   ├── 📂 controllers/        # Request handlers
│   │   ├── adminController.js
│   │   ├── userController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   ├── recycleController.js
│   │   └── rewardController.js
│   ├── 📂 models/             # Mongoose schemas
│   │   ├── userModel.js
│   │   ├── productModel.js
│   │   ├── orderModel.js
│   │   ├── RecycleSubmission.js
│   │   └── RewardModel.js
│   ├── 📂 routes/             # API routes
│   ├── 📂 middleware/         # Auth & validation
│   └── server.js              # Entry point
│
├── 📂 frontend/               # React/Vite frontend
│   ├── 📂 src/
│   │   ├── 📂 components/    # Reusable components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── Hero.jsx
│   │   ├── 📂 pages/         # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Rewards.jsx
│   │   │   └── RecycleHistory.jsx
│   │   ├── 📂 context/       # React Context
│   │   │   ├── ShopContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── 📂 admin/         # Admin portal
│   │   ├── 📂 seller/        # Seller portal
│   │   ├── 📂 buyer/         # Buyer portal
│   │   └── App.jsx
│   └── package.json
│
├── 📂 ml_model/               # Python ML model
│   ├── ml_model.py           # Model training
│   ├── ml_api.py             # FastAPI server
│   ├── train-model.py        # Training script
│   └── requirements.txt
│
├── 📄 LICENSE                 # MIT License
└── 📄 README.md              # This file
```

---

## 🔐 Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET_KEY=your_cloudinary_secret_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
ADMIN_EMAIL=admin@ecocyclehub.com
ADMIN_PASSWORD=your_admin_password
```

### Frontend (.env)
```env
VITE_BACKEND_URL=http://localhost:4000
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## 📡 API Documentation

### Authentication
- `POST /api/user/register` - User registration
- `POST /api/user/login` - User login
- `POST /api/admin/login` - Admin/Seller login

### Products
- `GET /api/product/list` - Get all products
- `POST /api/product/add` - Add product (Seller/Admin)
- `POST /api/product/remove` - Remove product
- `GET /api/product/single` - Get product details

### Orders
- `POST /api/order/place` - Place order
- `POST /api/order/stripe` - Stripe payment
- `POST /api/order/razorpay` - Razorpay payment
- `POST /api/order/userorders` - Get user orders

### Recycling
- `POST /api/recycle/submit` - Submit recycle request
- `GET /api/recycle/history` - Get submission history
- `POST /api/recycle/update-status` - Update status (Admin)

### Rewards
- `GET /api/rewards/user/:userId` - Get user rewards
- `GET /api/rewards/leaderboard` - Get leaderboard
- `POST /api/rewards/redeem` - Redeem points

### Centers
- `GET /api/center/list` - Get all centers
- `POST /api/center/add` - Add center (Admin)

---

## 🤖 ML Model

The platform uses a Random Forest Regressor model for price prediction:

### Features
- Product category
- Brand
- Condition (1-10 scale)
- Age (years)
- Market demand
- Specifications (RAM, storage, etc.)

### Training
```bash
cd ml_model
python train-model.py
```

### API Usage
```python
POST http://localhost:8000/predict
Content-Type: application/json

{
  "category": "laptop",
  "brand": "dell",
  "condition": 8,
  "age": 2,
  "specifications": {
    "ram": 16,
    "storage": 512
  }
}
```

---

## 🎨 Theme Support

The platform supports both light and dark themes:

- **Automatic Detection:** Respects system preferences
- **Manual Toggle:** Theme switcher in navbar
- **Persistent:** Saves preference in localStorage
- **Smooth Transitions:** Animated theme changes

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style
- Follow ESLint configuration for JavaScript
- Use Prettier for code formatting
- Write meaningful commit messages
- Add comments for complex logic

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

- **Project Lead:** Your Name
- **Backend Developer:** Team Member
- **Frontend Developer:** Team Member
- **ML Engineer:** Team Member

---

## 📞 Contact

- **Email:** contact@ecocyclehub.com
- **Website:** [https://ecocyclehub.com](https://ecocyclehub.com)
- **GitHub:** [@ecocyclehub](https://github.com/ecocyclehub)

---

## 🙏 Acknowledgments

- Icons by [Lucide](https://lucide.dev/)
- UI inspiration from modern e-commerce platforms
- ML dataset from Amazon Electronics reviews
- Community feedback and contributions

---

<div align="center">
  
  **Made with ♻️ and 💚 for a sustainable future**
  
  ⭐ Star us on GitHub if you find this project useful!
  
</div>
