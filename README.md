# Woo Backend

This is the backend for the Woo project, built with Node.js and Express. It provides RESTful APIs for authentication and product management, and integrates with WooCommerce.

## Features
- User authentication (register, login)
- Product CRUD operations
- WooCommerce integration
- JWT-based authentication
- Error handling middleware
- File upload support

## Project Structure
```
backend/
  src/
    app.js              # Express app setup
    server.js           # Server entry point
    config/             # Configuration files (DB, WooCommerce)
    controllers/        # Route controllers (auth, product)
    middleware/         # Auth, error handler, upload
    models/             # Mongoose models (user, product)
    routes/             # API routes (auth, product)
    services/           # Service logic (WooCommerce)
  package.json
  README.md
```

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment variables (e.g., MongoDB URI, JWT secret, WooCommerce keys).
3. Start the server:
   ```bash
   npm start
   ```

## API Endpoints
- `/api/auth` - Authentication routes
- `/api/products` - Product management routes

## License
MIT
