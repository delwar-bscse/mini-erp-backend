# Mini ERP Backend

A RESTful API built with **Node.js**, **Express.js**, **TypeScript**, and **MongoDB** for the Mini ERP system.

## Prerequisites

Before running this project, make sure you have installed:

* Node.js (v20 or later recommended)
* Yarn
* MongoDB (Local or Atlas)
* Git

---

## 1. Clone the Repository

```bash
git clone https://github.com/delwar-bscse/mini-erp-backend.git
```

Navigate to the project directory:

```bash
cd mini-erp-backend
```

---

## 2. Install Dependencies

Install all required packages using Yarn:

```bash
yarn install
```

---

## 3. Configure Environment Variables

Create a `.env` file in the project root.

Copy the following configuration into the file:

```env
# ==============================================================================
# Basic Server Configuration
# ==============================================================================
NODE_ENV=development
IP=127.0.0.1
PORT=5000

# ==============================================================================
# Database Configuration (MongoDB Local / Atlas Placeholder)
# ==============================================================================
DATABASE_URL="mongodb://username:password@your-cluster-shard.mongodb.net:27017/your_db_name?ssl=true&replicaSet=your-replica-set&authSource=admin"

# ==============================================================================
# Frontend URL Configuration
# ==============================================================================
FRONTEND_URL="http://localhost:3000"

# ==============================================================================
# Authentication Security (Bcrypt & JWT)
# ==============================================================================
BCRYPT_SALT_ROUNDS=12

JWT_SECRET="your_jwt_super_secret_key"
JWT_EXPIRE_IN="15d"

JWT_REFRESH_SECRET="your_jwt_refresh_super_secret_key"
JWT_REFRESH_EXPIRES_IN="30d"

# ==============================================================================
# SMTP Nodemailer Configuration
# ==============================================================================
EMAIL_FROM="noreply@yourdomain.com"
EMAIL_USER="your_email@gmail.com"
EMAIL_PASS="your_app_specific_password"
EMAIL_PORT=587
EMAIL_HOST="smtp.gmail.com"

# ==============================================================================
# Initial Super Admin Credentials
# ==============================================================================
ADMIN_EMAIL="admin@yourdomain.com"
ADMIN_PASSWORD="secure_temporary_password"
```

> **Note**
>
> Replace all placeholder values with your actual MongoDB, JWT, and email credentials before running the application.

---

## 4. Configure MongoDB

### Option 1: MongoDB Atlas

* Create a MongoDB Atlas cluster.
* Copy the connection string.
* Replace the `DATABASE_URL` value in the `.env` file.

### Option 2: Local MongoDB

Example:

```env
DATABASE_URL="mongodb://127.0.0.1:27017/mini_erp"
```

Make sure the MongoDB service is running before starting the server.

---

## 5. Run the Development Server

Start the application in development mode:

```bash
yarn dev
```

The server will start at:

```text
http://localhost:5000
```

---

## 6. Build the Project

Compile the TypeScript source code:

```bash
yarn build
```

---

## 7. Start the Production Server

Run the compiled application:

```bash
yarn start
```

---

## Available Scripts

| Command      | Description                              |
| ------------ | ---------------------------------------- |
| `yarn dev`   | Start development server with hot reload |
| `yarn build` | Compile TypeScript                       |
| `yarn start` | Run the production server                |
| `yarn test`  | Run tests (if configured)                |

---

## Project Structure

```text
mini-erp-backend/
│
├── src/
│   ├── app/
│   ├── config/
│   ├── middlewares/
│   ├── routes/
│   ├── modules/
│   ├── utils/
│   ├── types/
│   └── server.ts
│
├── uploads/
├── .env
├── package.json
├── tsconfig.json
└── README.md
```

---

## API Base URL

After the server starts successfully:

```text
http://localhost:5000/api/v1
```

---

## Tech Stack

* Node.js
* Express.js
* TypeScript
* MongoDB
* Mongoose
* JWT Authentication
* Bcrypt
* Nodemailer
* Multer

---

## Troubleshooting

### Cannot connect to MongoDB

* Verify the `DATABASE_URL` in the `.env` file.
* Ensure MongoDB is running.
* If using MongoDB Atlas, whitelist your IP address and verify your database credentials.

### JWT Authentication Errors

* Check that `JWT_SECRET` and `JWT_REFRESH_SECRET` are defined.
* Restart the server after updating the `.env` file.

### Email Sending Issues

* Verify the SMTP credentials.
* If using Gmail, generate and use an App Password instead of your account password.
* Confirm that the SMTP host and port are correct.

### Port Already in Use

Change the `PORT` value in the `.env` file:

```env
PORT=5001
```

Then restart the server.

---

## License

This project is intended for educational and internal ERP development purposes.
