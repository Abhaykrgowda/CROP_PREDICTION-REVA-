# 🌾 Smart Crop Prediction

An AI-powered agricultural advisory platform that helps Indian farmers maximize crop profitability through intelligent recommendations, real-time market intelligence, AI cultivation planning, and a carbon credits marketplace.

---

## 🏗️ Project Architecture

```
Smart-Crop-Prediction/
├── cropsmart-advisor/      # Crop recommendation web app (React + TypeScript)
├── verdant-credits/        # Carbon credits marketplace (React + TypeScript)
├── ml_model/               # Flask API, ML model, Telegram bot (Python)
├── crop_prediction_model.py  # Standalone model training script
└── requirements.txt        # Root Python dependencies
```

```
┌───────────────────────────────────────────────────┐
│              Vercel Serverless Platform            │
├─────────────────┬────────────────┬────────────────┤
│  CropSmart      │  Verdant       │  ML Backend    │
│  Advisor        │  Credits       │  (Flask/Python) │
│  React :8080    │  React :3001   │  API :5000     │
└────────┬────────┴───────┬────────┴───────┬────────┘
         │                │                │
┌────────┴────────────────┴────────────────┴────────┐
│              External APIs & Services             │
├───────────────────────────────────────────────────┤
│  • Google Gemini 2.0 Flash  (AI / Vision)         │
│  • OpenWeather API          (Real-time weather)   │
│  • AGMARKNET API            (Crop market prices)  │
│  • Twilio Verify            (SMS OTP auth)        │
│  • Telegram Bot API         (Daily notifications) │
└───────────────────────────────────────────────────┘
```

---

## ✨ Key Features

### CropSmart Advisor
- **AI Crop Recommendation** — RandomForest model (200 trees) predicts top 3 crops with confidence scores based on soil NPK, pH, weather & location
- **Real-time Market Prices** — Live price data from AGMARKNET (Government of India) with profit/revenue projections
- **Auto Soil Detection** — Soil type & NPK values estimated from GPS coordinates
- **Weather Integration** — Temperature, humidity & rainfall fetched from OpenWeather API
- **90-Day AI Cultivation Calendar** — Google Gemini generates a daily farming schedule with watering, fertilizing, pest control & inspection tasks
- **Telegram Bot with Crop Health Monitoring** — Daily task notifications + Gemini Vision photo analysis for disease detection
- **Phone OTP Authentication** — Twilio Verify-based secure login

### Verdant Credits (Carbon Marketplace)
- **Carbon Credit Calculation** — Auto-computed from farm NPK levels and size
- **Farmer ↔ Buyer Marketplace** — Farmers list credits; companies browse, buy in bulk
- **Verified Certificates** — Downloadable carbon credit certificates
- **CropSmart Integration** — One-click credit calculation from crop advisor results
- **Multi-language Support** — English, Hindi & Kannada (हिंदी, ಕನ್ನಡ)

### Telegram Bot
- **Daily Farm Digest** — Morning notifications with today's cultivation tasks
- **Crop Photo Analysis** — Upload a photo → Gemini Vision detects health status, diseases & growth stage
- **Multi-language Alerts** — Task descriptions translated to farmer's preferred language

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite 5, Tailwind CSS, ShadCN/UI, Framer Motion |
| **Backend** | Flask 3.0, Python 3.x |
| **ML Model** | scikit-learn (RandomForestClassifier), pandas, NumPy |
| **AI / LLM** | Google Gemini 2.0 Flash (cultivation planning + image analysis) |
| **Database** | SQLite3 (backend), localStorage (Verdant Credits) |
| **Auth** | Twilio Verify (SMS OTP) |
| **Payments** | Stripe (Verdant Credits marketplace) |
| **Bot** | python-telegram-bot v20+ |
| **Deployment** | Vercel (serverless) |

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.9+**
- **Node.js 18+** (with npm or bun)
- API keys for: Gemini, OpenWeather, Twilio, AGMARKNET, Telegram Bot

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/Smart-Crop-Prediction.git
cd Smart-Crop-Prediction
```

### 2. Install Dependencies

```bash
# Python (backend + ML)
cd ml_model
pip install -r requirements.txt

# CropSmart Advisor (frontend)
cd ../cropsmart-advisor
npm install

# Verdant Credits (frontend)
cd ../verdant-credits
npm install
```

### 3. Configure Environment Variables

Create `ml_model/.env`:

```env
# Twilio (SMS OTP)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_VERIFY_SERVICE_SID=your_twilio_verify_service_sid
TWILIO_DEFAULT_COUNTRY_CODE=+91

# Google Gemini (AI + Vision)
GEMINI_API_KEY=your_gemini_api_key

# AGMARKNET (Crop market prices)
AGMARKNET_API_KEY=your_agmarknet_api_key
AGMARKNET_RESOURCE_ID=9ef84268-d588-465a-a308-a864a43d0070

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
DAILY_NOTIFY_HOUR=7
DAILY_NOTIFY_MINUTE=0
```

Create `cropsmart-advisor/.env`:

```env
VITE_API_BASE_URL=http://127.0.0.1:5000
VITE_OPENWEATHER_API_KEY=your_openweather_api_key
```

### 4. Train the ML Model

```bash
cd ml_model
python train_model.py
```

This trains a RandomForestClassifier on `Crop_recommendation.csv` and saves `crop_model.pkl`.

### 5. Run Locally

Open four terminals:

```bash
# Terminal 1 — Flask API (port 5000)
cd ml_model
python app.py

# Terminal 2 — CropSmart Advisor (port 8080)
cd cropsmart-advisor
npm run dev

# Terminal 3 — Verdant Credits (port 3001)
cd verdant-credits
npm run dev

# Terminal 4 — Telegram Bot (optional)
cd ml_model
python telegram_bot.py
```

Then open:
- **CropSmart Advisor**: http://localhost:8080
- **Verdant Credits**: http://localhost:3001
- **API Docs**: http://127.0.0.1:5000

---

## 🤖 ML Model Details

| Property | Value |
|----------|-------|
| **Algorithm** | RandomForestClassifier (200 estimators) |
| **Training Data** | `ml_model/Crop_recommendation.csv` — 2200 samples, 22 crops |
| **Input Features** | N, P, K (mg/kg), Temperature (°C), Humidity (%), pH (0–14), Rainfall (mm) |
| **Output** | Top 3 crop names with confidence percentages |

**Supported Crops:** Rice, Wheat, Maize, Cotton, Chickpea, Blackgram, Mungbean, Pigeonpeas, Kidney Beans, Mothbeans, Coconut, Banana, Mango, Papaya, Pomegranate, Orange, Grapes, Apple, Watermelon, Muskmelon, Coffee, Jute, Lentil

**Input Validation:**
| Field | Range |
|-------|-------|
| pH | 0 – 14 |
| NPK (N, P, K) | ≥ 0 |
| Humidity | 0 – 100% |
| Temperature | -60 – 60°C |
| Rainfall | ≥ 0 |
| Farm Size | > 0 |

---

## 📡 API Endpoints

**Base URL:** `http://127.0.0.1:5000`

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/auth/send-otp` | Send SMS OTP `{name, phone}` |
| POST | `/auth/verify-otp` | Verify OTP & register `{name, phone, otp}` |
| POST | `/auth/login` | Login by phone `{phone}` |

### Prediction

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/predict` | Get top 3 crop predictions with market prices & profit estimates |

**Request body:**
```json
{
  "N": 90, "P": 42, "K": 43,
  "temperature": 25.5,
  "humidity": 80,
  "ph": 6.5,
  "rainfall": 200,
  "farm_size": 2,
  "unit": "Acres"
}
```

**Response:**
```json
[
  {
    "crop": "rice",
    "confidence": 87.5,
    "market_price": 2150,
    "price_source": "AGMARKNET",
    "expected_yield_qtl_per_acre": 32,
    "expected_revenue": 137600,
    "estimated_cost_per_acre": 45000,
    "probable_profit": 47600,
    "area_acres": 2
  }
]
```

### Cultivation Planning

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/cultivation-plan` | Generate 90-day AI farming calendar |

**Request body:**
```json
{
  "crop": "rice",
  "soil_type": "Clay",
  "weather": { "temp": 25, "humidity": 80, "rainfall": 200 },
  "farm_size": 2,
  "unit": "Acres",
  "start_date": "2026-03-11",
  "phone": "9876543210"
}
```

### Farmer Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/farmer/plan?phone=9876543210` | Get active cultivation plan |
| POST | `/farmer/language` | Set preferred language `{phone, language}` |
| GET | `/farmer/photos?phone=9876543210` | Get crop photos with AI analysis |

---

## 📱 User Flow

```
Landing Page
    │
    ▼
Phone OTP Login (Twilio)
    │
    ▼
Dashboard ── 4-Step Input ──────────────────────────────────┐
    │  Step 1: Farm Location (GPS / manual lat-long)        │
    │  Step 2: Soil Type + NPK + pH (auto-detected)         │
    │  Step 3: Weather (auto-fetched from OpenWeather)       │
    │  Step 4: Farm Size                                     │
    │                                                        │
    ▼                                                        │
Results ── Top 3 Crops with Profit Estimates                 │
    │                                                        │
    ▼                                                        │
Crop Detail ── Investment, Yield, Market Price               │
    │                                                        │
    ├──► Generate 90-Day Cultivation Plan (Gemini AI)        │
    │         └──► Farm Calendar (daily tasks)               │
    │                                                        │
    └──► Verdant Credits ── Carbon Credit Marketplace ◄──────┘
              ├── Farmer: Calculate & list credits
              └── Buyer: Browse & purchase credits
```

---

## 🗄️ Database Schema (SQLite)

```sql
-- Farmer registration
farmers (id, name, phone UNIQUE, created_at)

-- OTP verification (5-min expiry)
otp_requests (id, name, phone, otp, expires_at, created_at)

-- AI cultivation plans
cultivation_plans (id, phone, crop, soil_type, weather_json,
    farm_size, unit, start_date, end_date, schedule_json,
    source, latitude, longitude, nitrogen, phosphorus,
    potassium, created_at)

-- Telegram crop photos + Gemini analysis
crop_photos (id, phone, date, filename, analysis, created_at)

-- Telegram bot linking
telegram_links (id, phone UNIQUE, chat_id, farmer_name,
    preferred_language, linked_at)
```

---

## 🌐 Deployment (Vercel)

Each sub-project has its own `vercel.json` and can be deployed independently:

| Project | Framework | Build Command | Output |
|---------|-----------|--------------|--------|
| `cropsmart-advisor/` | Vite (React) | `npm run build` | `dist/` |
| `verdant-credits/` | Vite (React) | `npm run build` | `dist/` |
| `ml_model/` | @vercel/python (Flask) | — | Serverless function |

**Steps:**
1. Push to GitHub
2. Import each folder as a separate Vercel project
3. Set environment variables in the Vercel dashboard
4. Deploy

---

## 🌍 Internationalization

Verdant Credits and Telegram notifications support three languages:

| Code | Language |
|------|----------|
| `en` | English |
| `hi` | हिंदी (Hindi) |
| `kn` | ಕನ್ನಡ (Kannada) |

Language can be switched via the UI toggle or set via the `/farmer/language` API for Telegram notifications.

---

## 📂 Project Structure

```
Smart-Crop-Prediction/
│
├── cropsmart-advisor/               # Main crop advisor frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Index.tsx            # Landing page
│   │   │   ├── Auth.tsx             # OTP login/register
│   │   │   ├── Dashboard.tsx        # 4-step input form
│   │   │   ├── Results.tsx          # Top 3 crop results
│   │   │   ├── CropDetail.tsx       # Detailed crop analysis
│   │   │   └── FarmCalendar.tsx     # 90-day schedule
│   │   ├── components/ui/           # ShadCN/UI components
│   │   └── assets/crop images/      # 22 crop images
│   ├── package.json
│   └── vercel.json
│
├── verdant-credits/                 # Carbon credits marketplace
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx      # Farmer/Buyer split login
│   │   │   ├── FarmerDashboard.tsx   # Register farm + credits
│   │   │   ├── MarketPage.tsx       # Browse & buy credits
│   │   │   ├── CertificatePage.tsx  # Download certificate
│   │   │   └── BuyerLogin.tsx       # Company sign-in
│   │   └── lib/
│   │       ├── storage.ts           # Carbon credit logic
│   │       └── i18n.tsx             # EN / HI / KN translations
│   ├── package.json
│   └── vercel.json
│
├── ml_model/                        # Backend (Flask + ML + Bot)
│   ├── app.py                       # Flask API (all endpoints)
│   ├── train_model.py               # Model training script
│   ├── cultivation_service.py       # Gemini-powered farm calendar
│   ├── market_price_service.py      # AGMARKNET price fetching
│   ├── telegram_bot.py              # Telegram bot (notifications + photo analysis)
│   ├── Crop_recommendation.csv      # Training dataset (22 crops)
│   ├── requirements.txt             # Python dependencies
│   ├── vercel.json                  # Serverless deployment config
│   └── api/index.py                 # Vercel entrypoint
│
├── crop_prediction_model.py         # Standalone training script
├── requirements.txt                 # Root Python dependencies
└── README.md                        # ← You are here
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "Add my feature"`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📜 License

This project was built as part of **Hackathon REVA** — Smart Crop Prediction.
