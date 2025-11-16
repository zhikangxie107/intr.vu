# intr.vu

A modern interview preparation and practice platform built for programmers. Designed to streamline the mock‑interview experience with real‑time feedback, user authentication, and intuitive UI.

## Tech Stack

* **Frontend:** Next.js / React

* **Backend:** Node.js (Express)

* **Database:** Supabase

---

## 🖥️ Running the Project Locally

### 1. Clone the Repository

```bash
 git clone git@github.com:zhikangxie107/intr.vu.git
 cd intr.vu
```

---

## 📁 Project Structure

```
intr.vu/
├── src/
│   ├── app/
│   ├── components/
│   ├── public/
│   └── package.json
├── Backend/
│   ├── index.js
│   ├── routes/
│   ├── controllers/
│   └── package.json
└── README.md
```

## 🌐 Environment Variables

Create a `.env` file for the Backend directory

### Environment Setup
```bash
cd backend
cp .env.example .env
```
insert the following keys in the `.env`

---

## ▶️ Running the Frontend

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

The frontend should now be running at:

```
http://localhost:3000
```

---

## 🛠️ Running the Backend

Navigate to the backend directory:

```bash
cd backend
```

Install backend dependencies:

```bash
npm install
```

Start the backend server:

```bash
node index.js
```

The backend will  run at:

```
http://localhost:5050
```

(or whichever port is configured in `index.js`)

