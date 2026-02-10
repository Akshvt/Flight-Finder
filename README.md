# ✈️ Flight Booking App

A full-stack MERN (MongoDB, Express, React, Node.js) application for searching, comparing, and booking flights in a fast, intuitive, and user-friendly way.

## 🧠 Project Overview

Flight Booking App is a modern web application designed to simplify the process of booking flights. Users can search for flights, compare options, view detailed information, and book tickets — all in one place with a seamless experience.

## 👨‍💻 Tech Stack

| Layer       | Technology                  |
|------------|-----------------------------|
| Frontend   | React, Bootstrap, Axios     |
| Backend    | Node.js, Express.js         |
| Database   | MongoDB + Mongoose          |
| Auth       | JWT (JSON Web Tokens)       |
| Styling    | Bootstrap + Custom CSS      |

---

## 🚀 Features

- 🔍 **Advanced Flight Search** — Filter by destination, price, date, airline, and more
- 🧾 **Real-Time Flight Comparison**
- 🔐 **Secure User Authentication** — JWT-based login/signup
- 💳 **Booking & Payment Integration** (Placeholder logic)
- 📊 **User Dashboard** — Manage upcoming trips and view history
- 📱 **Mobile Responsive UI**

---

## 🛠️ Setup Instructions

### 🔧 Prerequisites

- Node.js >= 16
- MongoDB (Local or Atlas)
- npm or yarn

### 🗂️ Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/flight-booking-app.git
cd flight-booking-app

# 2. Setup the backend
cd server
npm install
touch .env

# .env example
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key

# 3. Setup the frontend
cd ../client
npm install

# 4. Run the application
# In /client
npm start

# In /server
npm start
