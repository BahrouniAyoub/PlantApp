# 📦 Tech Stack
- **Frontend:** React Native, Expo, TypeScript
- **Backend:** Node.js, Express, MongoDB
- **API:** Plant.id API v3
- **State Management:** Redux Toolkit

---

## 🛠 Installation & Setup

### 1️⃣ Clone the Repository
git clone https://github.com/your-username/your-repository.git
cd your-repository

## 2️⃣ Install Dependencies
npm install

## 3️⃣ Set Up Environment Variables

PLANT_ID_API_KEY = 'H2PEHTBnlBy9TPy53lRfozUyBjLBsUQQlZEIGXWRBqx4A0Dr23';
PLANT_ID_API_URL = 'https://plant.id/api/v3/';
API_URL=<your_ip_adress>:5000
JWT_SECRET=qdjfhjkdqhfdhq
MONGO_URI=your_mongodb_uri

## 4️⃣ Start the Backend
cd backend
npm start

## 5️⃣ Start the Frontend
npx expo start


## 📌 API Endpoints

    🔹 Authentication
        Method |	Endpoint	   |  Description
        POST   | /api/auth/login   |  User login
        POST   | /api/auth/signup  |  User registration
        Get	   | /api/auth/profile |  User profile

    🔹 Plant Management
        Method |   Endpoint	          |  Description
        GET	   | /api/plants/:userId  |  Get all user plants
        POST   | /api/plants	      |  Add a new plant



