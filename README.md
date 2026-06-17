# MedConnect - Professional Medical Networking Platform

MedConnect is an exclusive, secure, and professional social networking and consultation platform built strictly for verified medical professionals (Doctors). It aims to bridge the gap between healthcare practitioners, providing them with a secure environment to discuss clinical cases, share medical knowledge, and communicate in real-time.

![MedConnect Banner](public/vercel.svg)

## 🌟 Key Features

- **Strict PMDC Verification:** Every user must upload their PMDC certificate. The system extracts the license number and name to verify credentials before granting access.
- **Two-Factor Authentication (2FA) & SMS OTP:** Secure login with 2FA email and SMS notifications (Twilio integration).
- **Clinical Feed & Social Networking:** 
  - Share medical insights, posts, and clinical cases.
  - Follow colleagues or send them Friend Requests.
  - Granular privacy and clean UI distinguishing "Friends" from "Followers".
- **Real-time Encrypted Chat:** 
  - Real-time messaging using Socket.io.
  - WhatsApp-style Read Receipts (Single tick, Double grey tick, Double blue tick).
  - Mobile-responsive chat interface.
- **AI Case Assistant:** Built-in AI to help doctors analyze complex medical scenarios, differential diagnoses, and treatment plans.
- **Dynamic User Profiles:** Rich profiles showcasing specializations, hospitals, medical college, and experience years.
- **Settings & Notifications:** Facebook-style comprehensive settings dashboard for account security and notification management.

## 💻 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Custom CSS Modules
- **Database:** PostgreSQL (via Prisma ORM)
- **Real-time:** Socket.io
- **AI Integration:** Google Gemini API / OpenAI API
- **Authentication:** Custom JWT-based Auth + OTP Email/SMS Verification
- **Storage:** Local / Cloud-based Image Uploads

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL Database
- Twilio Account (Optional, for SMS OTPs)
- SMTP Server (e.g., Gmail for Email OTPs)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/muhammadokashapak/medconnect.git
   cd medconnect
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/medconnect"
   JWT_SECRET="your_super_secret_jwt_key"
   
   # Email Config
   SMTP_EMAIL="your_email@gmail.com"
   SMTP_PASSWORD="your_app_password"

   # SMS Config (Optional)
   TWILIO_ACCOUNT_SID="your_twilio_sid"
   TWILIO_AUTH_TOKEN="your_twilio_auth_token"
   TWILIO_PHONE_NUMBER="+1234567890"
   ```

4. **Run Prisma Migrations:**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```

6. **Open the App:**
   Visit `http://localhost:3000` in your browser.

## 📱 Screenshots & UI

The UI is built with a focus on **Professional Aesthetics**, utilizing clean typography, subtle micro-animations, and a highly responsive layout optimized for both desktop and mobile devices.

### Mobile Interfaces
<div style="display: flex; gap: 10px; overflow-x: auto;">
  <img src="public/screenshots/mobile_profile.png" alt="Mobile Profile" width="300" />
  <img src="public/screenshots/mobile_feed.png" alt="Mobile Feed" width="300" />
</div>

## 🤝 Contributing

We welcome contributions to MedConnect! If you are a developer with a background in healthcare tech or just passionate about secure networking platforms, feel free to submit a Pull Request.

---
*Developed with dedication for the medical community.*
