# EcoCycleHUB ♻️

**EcoCycleHUB** is a full-stack sustainability marketplace that combines a second-hand e-commerce store with a recycling & repair ecosystem. Users can buy and sell pre-owned fashion and electronics, locate nearby recycling/repair centers, submit items for recycling, and earn reward points, badges and certificates for eco-friendly actions. An ML microservice predicts a fair resale price for listed products.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Backend (Node/Express)](#1-backend-nodeexpress)
  - [2. ML Price-Prediction API (FastAPI)](#2-ml-price-prediction-api-fastapi)
  - [3. Frontend (React/Vite)](#3-frontend-reactvite)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API Reference](#api-reference)
- [Rewards System](#rewards-system)
- [ML Model](#ml-model)
- [Deployment](#deployment)
- [Additional Documentation](#additional-documentation)
- [Contributing](#contributing)
- [License](#license)

## Features

### Shopper (public storefront)
- Browse, search and filter a collection of pre-owned **fashion** and **electronics** products
- Product detail pages with related products, cart and checkout
- Payments via **Cash on Delivery**, **Stripe** or **Razorpay**
- Order history and order status tracking
- Email/password auth with **forgot / reset password**, plus Firebase phone/Google auth support
- **Light / dark mode** across every page

### Recycling & repair
- **Centers map** – find recycling / repair centers near you (Haversine distance search by latitude/longitude and radius)
- Submit items for **recycle** or **repair** at a center, with condition and ML-predicted value
- Personal **recycle history**

### Gamification
- **Reward points** for logging in, placing orders and recycling
- Auto-levelling **Bronze / Silver / Gold** tiers
- Public **leaderboard**
- Downloadable **eco certificate** (PDF) and shareable **badge** (with QR code & confetti 🎉)

### Seller portal (`/seller`)
- Seller onboarding with **mobile OTP verification**, profile photo and **Aadhaar KYC** upload (Cloudinary)
- Add products (up to 4 images) with **AI price suggestion**
- Manage own listings and view orders for own products

### Admin portal (`/admin`)
- Product list & removal, all orders and status updates
- View all users with reward points and their recycle submissions
- **Seller KYC review** – approve / reject pending sellers

### ML price prediction
- FastAPI microservice with two trained models (**electronics** & **fashion**)
- Condition-aware pricing with a rule-based fallback when features are sparse

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 7, React Router 6, Tailwind CSS 3, Framer Motion, Lucide icons, Swiper, tsParticles, react-toastify, jsPDF + html2canvas, qrcode.react, Firebase Auth |
| Backend | Node.js, Express 4, Mongoose 8 (MongoDB), JWT, bcrypt, Multer, Cloudinary, Stripe, Razorpay, Axios |
| ML service | Python 3, FastAPI, Uvicorn, scikit-learn, XGBoost, NumPy, pandas, joblib |
| Database | MongoDB (Atlas) |
| Media storage | Cloudinary |
| Hosting | Vercel / Netlify (frontend), Render / Vercel (backend) |

## Architecture

```
┌───────────────────────┐        ┌──────────────────────────┐        ┌──────────────────────────┐
│  Frontend (React)     │  REST  │  Backend (Express)       │  HTTP  │  ML API (FastAPI)        │
│  :5173                │──────▶ │  :4000                   │──────▶ │  :8000                   │
│  storefront / admin / │        │  /api/*                  │        │  /predict-price          │
│  seller / buyer       │        │  JWT auth, Multer uploads│        │  electronics + fashion   │
└───────────────────────┘        └──────┬──────────┬────────┘        │  .pkl models             │
                                        │          │                 └──────────────────────────┘
                                   MongoDB     Cloudinary
                                   (Atlas)     (images)
```

- The **frontend** is a single Vite app; the admin (`/admin/*`), seller (`/seller/*`) and buyer (`/buyer/*`) portals are nested route trees inside it.
- The **backend** exposes a REST API under `/api`, persists data in MongoDB, stores images in Cloudinary and proxies price-prediction requests to the ML API.
- The **ML API** is an independent Python service; the backend reaches it through `ML_API_URL`.

## Project Structure

```
EcoCycleHUB/
├── backend/                 # Express REST API
│   ├── config/              # MongoDB & Cloudinary connections
│   ├── controllers/         # user, product, cart, order, center, recycle, reward, seller, admin
│   ├── middleware/          # auth (user), adminAuth, sellerAuth, multer
│   ├── models/              # Mongoose schemas (user, product, order, center, RecycleSubmission, Reward)
│   ├── routes/              # /api/* routers
│   ├── seedCenters.js       # seeds sample recycling/repair centers
│   ├── server.js            # app entry point
│   └── .env.example
├── frontend/                # React + Vite app
│   ├── src/
│   │   ├── pages/           # Home, Collection, Product, Cart, PlaceOrder, Orders, Profile,
│   │   │                    # Centers, Rewards, RecycleHistory, Certificate, Badge, Login, ...
│   │   ├── components/      # Navbar, Footer, Hero, ProductItem, SearchBar, CartTotal, ...
│   │   ├── context/         # ShopContext (cart/products/auth), ThemeContext (dark mode)
│   │   ├── admin/           # Admin portal (List, Orders, Users, SellerKYC)
│   │   ├── seller/          # Seller portal (login/onboarding, Add, List, Orders)
│   │   ├── buyer/           # Buyer portal
│   │   └── firebase.js
│   └── .env.example
├── ml_model/                # FastAPI price-prediction service + training scripts
│   ├── ml_api.py            # API entry point
│   ├── train_electronics.py / train_fashion.py / train_improved.py ...
│   ├── electronics_price_model.pkl, fashion_price_model.pkl
│   └── requirements.txt
├── START_ML_API.sh / .bat   # helper scripts to launch the ML API
└── *.md                     # design notes & change logs (see Additional Documentation)
```

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+ (for the ML service)
- A **MongoDB** connection string (e.g. MongoDB Atlas)
- A **Cloudinary** account (image uploads)
- Optional: **Stripe** / **Razorpay** test keys, **Firebase** project for phone/Google auth

Clone the repository:

```bash
git clone https://github.com/Atharvb03/EcoCycleHUB.git
cd EcoCycleHUB
```

### 1. Backend (Node/Express)

```bash
cd backend
npm install
cp .env.example .env        # then fill in your values
npm run server              # dev with nodemon  (or: npm start)
```

The API starts on `http://localhost:4000` (`GET /` returns `API Working`).

Optionally seed sample recycling/repair centers:

```bash
node seedCenters.js
```

### 2. ML Price-Prediction API (FastAPI)

```bash
cd ml_model
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn ml_api:app --reload --port 8000
```

Interactive docs are available at `http://localhost:8000/docs`. Pre-trained `electronics_price_model.pkl` and `fashion_price_model.pkl` are committed, so no training is required to get started. Make sure the backend's `ML_API_URL` points at `http://127.0.0.1:8000/predict-price`.

### 3. Frontend (React/Vite)

```bash
cd frontend
npm install
cp .env.example .env        # set VITE_BACKEND_URL=http://localhost:4000
npm run dev
```

Open `http://localhost:5173`.

| Portal | URL | Login |
|--------|-----|-------|
| Storefront | `/` | Register any user |
| Admin | `/admin` | `ADMIN_EMAIL` / `ADMIN_PASSWORD` from backend `.env` |
| Seller | `/seller` | Register as seller (OTP is printed in the backend console during development) |
| Buyer | `/buyer` | Regular user account |

## Environment Variables

### `backend/.env`

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign JWTs |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Credentials for the admin portal |
| `PORT` | Server port (default `4000`) |
| `CLOUDINARY_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_SECRET_KEY` | Cloudinary credentials for image uploads |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Razorpay credentials |
| `ML_API_URL` | Full URL of the ML predict endpoint (e.g. `http://127.0.0.1:8000/predict-price`) |
| `FRONTEND_URL` | Comma-separated list of allowed CORS origins |

### `frontend/.env`

| Variable | Description |
|----------|-------------|
| `VITE_BACKEND_URL` | Base URL of the backend API (e.g. `http://localhost:4000`) |
| `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID` | Firebase web app config (phone / Google auth) |

> Never commit `.env` files. Only the `.env.example` templates are tracked.

## Available Scripts

### backend
| Command | Description |
|---------|-------------|
| `npm start` | Start the API with Node |
| `npm run server` | Start with nodemon (auto-reload) |
| `npm run ml` | Launch the ML API from the backend folder (Windows venv path) |

### frontend
| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server on port 5173 |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint (`js,jsx`, zero warnings allowed) |

### ml_model
| Command | Description |
|---------|-------------|
| `python -m uvicorn ml_api:app --reload --port 8000` | Run the prediction API |
| `python train_electronics.py` / `python train_fashion.py` | Train the individual models |
| `python run_training.py` / `./train_model.sh` / `train_model.bat` | Full training pipeline |
| `python test_predictions.py` | Sanity-check predictions |
| `python show_accuracy.py` | Print model accuracy metrics |

## API Reference

All routes are prefixed with `/api`. Protected routes expect a JWT in the `token` header (user), or an admin/seller token as issued by the corresponding login endpoint.

### Users – `/api/user`
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/register` | – | Register a user |
| POST | `/login` | – | Login (awards login points) |
| POST | `/admin` | – | Admin login |
| POST | `/forgot-password` | – | Request a password reset |
| POST | `/reset-password` | – | Reset password |
| GET | `/me` | user | Current user profile |

### Products – `/api/product`
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/list` | – | List all products |
| POST | `/single` | – | Get a single product |
| POST | `/add` | – | Add a product (`image1`–`image4` multipart; used by the admin portal) |
| POST | `/remove` | – | Remove a product (used by the admin portal) |
| POST | `/predict-price` | – | Get an ML price suggestion (proxied to the ML API) |
| GET | `/seller/list` | seller | Seller's own products |
| POST | `/seller/add` | seller | Seller adds a product |
| POST | `/seller/remove` | seller | Seller removes own product |

### Cart – `/api/cart`
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/get` | user | Get cart |
| POST | `/add` | user | Add item |
| POST | `/update` | user | Update quantity |

### Orders – `/api/order`
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/place` | user | Cash-on-delivery order |
| POST | `/stripe` | user | Create Stripe checkout |
| POST | `/razorpay` | user | Create Razorpay order |
| POST | `/verifyStripe` | user | Verify Stripe payment |
| POST | `/verifyRazorpay` | user | Verify Razorpay payment |
| POST | `/userorders` | user | Current user's orders |
| POST | `/list` | admin/seller | All orders |
| POST | `/status` | admin/seller | Update order status |
| POST | `/seller/list` | seller | Orders containing the seller's products |

### Centers – `/api/centers`
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/` | – | All centers |
| GET | `/nearby?lat=&lng=&radiusKm=` | – | Centers within a radius, sorted by distance |
| POST | `/` | – | Create a center |
| PUT | `/:id` | – | Update a center |
| DELETE | `/:id` | – | Delete a center |

### Recycle – `/api/recycle`
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/` | user | Submit an item for recycle/repair (awards points) |
| GET | `/mine` | user | Current user's submissions |

### Rewards – `/api/rewards`
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/me` | user | My points, breakdown and level |
| GET | `/leaderboard` | user | All users sorted by points |
| GET | `/history/:userId` | user | Recycle history for a user |

### Seller – `/api/seller`
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/register` | – | Start seller registration (sends OTP) |
| POST | `/verify-otp` | – | Verify mobile OTP |
| POST | `/resend-otp` | – | Resend OTP |
| POST | `/upload-photo` | – | Upload profile photo |
| POST | `/upload-aadhaar` | – | Upload Aadhaar for KYC |
| POST | `/complete` | – | Finish registration |
| POST | `/login` | – | Seller login |

### Admin – `/api/admin`
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/users` | admin/seller | All users with points |
| GET | `/recycles` | admin/seller | All recycle submissions |
| GET | `/recycles/user/:userId` | admin/seller | Submissions for a user |
| GET | `/pending-sellers` | admin | Sellers awaiting KYC review |
| POST | `/review-seller` | admin | Approve / reject a seller |

### ML API (FastAPI, port 8000)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/` | Status and which models are loaded |
| GET | `/health` | Health check |
| POST | `/predict-price` | Form fields: `name`, `description`, `category` (`Electronics` or fashion), `subCategory`, `condition`, `rating`, `review_count`, optional `image` |

## Rewards System

| Action | Points |
|--------|--------|
| Login | +10 |
| Place an order (COD / Stripe / Razorpay) | +20 |
| Recycle / repair submission | +20 |

Levels are derived automatically from total points:

| Level | Points |
|-------|--------|
| Bronze | ≥ 50 |
| Silver | ≥ 100 |
| Gold | ≥ 200 |

Points are tracked per source (`loginPoints`, `orderPoints`, `recyclePoints`) and surfaced on the Rewards, Certificate and Badge pages.

## ML Model

The price predictor lives in `ml_model/` and serves two independent models:

- **Electronics** – TF-IDF text features + structured features (brand, category, rating, review count) → regression model.
- **Fashion** – TF-IDF + material / colour / product-type encodings → log-price regression model.

At inference time the API combines name, sub-category and description, runs the appropriate model, applies a **condition multiplier** (`New` 1.0 → `Poor` 0.30) and falls back to a keyword-based rule table when the ML output is unreliable.

To retrain, drop your CSV datasets into `ml_model/` (CSV files are git-ignored) and run the training scripts listed in [Available Scripts](#available-scripts). See `ml_model/QUICKSTART.md`, `ml_model/ACCURACY_REPORT.md` and `ML_MODEL_IMPROVEMENTS.md` for details.

## Deployment

- **Frontend** – `frontend/vercel.json` and `frontend/netlify.toml` are included with SPA rewrites; set the `VITE_*` variables in your hosting dashboard.
- **Backend** – `backend/vercel.json` is provided for Vercel; the project has also been deployed on Render. Set all backend env vars and add your frontend origin to the CORS allow-list in `server.js` / `FRONTEND_URL`.
- **ML API** – deploy as a standard Uvicorn/FastAPI service and point the backend's `ML_API_URL` at it.

## Additional Documentation

| File | Contents |
|------|----------|
| `UI_QUICK_START.md`, `frontend/QUICK_UI_SETUP.md` | UI setup guide |
| `UI_IMPROVEMENTS_SUGGESTIONS.md`, `CRAZY_UI_IMPROVEMENTS.md` | UI design ideas |
| `UI_IMPLEMENTATION_COMPLETE.md`, `UI_UPGRADE_COMPLETE.md`, `PAGES_UPGRADED_SUMMARY.md` | UI change logs |
| `ML_MODEL_IMPROVEMENTS.md`, `ml_model/README_IMPROVEMENTS.md`, `ml_model/SUMMARY.md` | ML model design & improvements |
| `ml_model/QUICKSTART.md`, `ml_model/ELECTRONICS_SETUP.md`, `ml_model/ACCURACY_REPORT.md` | ML training & evaluation |
| `commands.txt`, `Commands2.txt` | Handy run commands |

## Contributing

1. Fork the repository and create a feature branch (`git checkout -b feature/my-feature`).
2. Make your changes; run `npm run lint` in `frontend/` before committing.
3. Open a pull request describing what you changed and why.

## License

No license file is included yet; the backend `package.json` declares **ISC**. Add a `LICENSE` file to make the terms explicit.
