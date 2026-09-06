# Production-Ready TypeScript Express Boilerplate

A bulletproof, enterprise-grade Express.js boilerplate wrapper designed for building highly secure, performant, and observable REST APIs. Created as a professional template to bootstrap backend services instantly with industry-standard patterns, now fully rewritten in strict TypeScript.

**Author:** [Monu Kumar (monukd01dev)](https://github.com/monukd01dev)  
**Role:** Software Engineer

---

## 🚀 Key Features

- **Strict TypeScript Architecture:** 100% Type-Safe codebase utilizing custom declaration merging for Express Request objects and powered by the blazing-fast `tsx` runtime.
- **Robust Security First:** Integrated with [Helmet](https://helmetjs.github.io/) to set secure HTTP headers, configured [CORS](https://github.com/expressjs/cors) with credentials, and strict route-level [Express Rate Limiting](https://github.com/express-rate-limit/express-rate-limit) to guard against DDoS and brute-force attacks.
- **Enterprise-Grade Logging (Pino):** Uses [Pino](https://github.com/pinojs/pino) & [Pino-HTTP](https://github.com/pinojs/pino-http) for ultra-fast, structured JSON logging. Includes:
  - Automated request logging with sensitive data redaction (e.g., passwords, JWT tokens).
  - High-performance log serialization (excluding heavy, expensive request headers).
  - Dual-target streaming: beautiful colorful logs in development (`pino-pretty`) and raw JSON logged directly to `/logs/app.log` in production.
  - Automatic exclusion of health-check route logs and browser noise (like `/favicon.ico`) to avoid filling up disks with orchestrator garbage.
- **Fail-Fast Environment Validation:** Direct verification of `.env` files on boot with strict `NODE_ENV` enum validation and synchronous process termination on missing variables—preventing runtime crashes. All configurations are permanently locked using `Object.freeze()` to prevent malicious runtime modifications.
- **Advanced Error Architecture:** Features a custom, operational-aware `AppError` class. Implements a centralised `globalErrorHandler` adhering strictly to JSend formatting. Includes:
  - Custom stack trace sanitization (automatically filters out `node_modules` and Node internals from stack logs to save space and enhance readability).
  - Clean separation of Development mode (verbose stack details) and Production mode (safe, generalized user messages for unhandled errors).
- **Graceful Shutdown & Shutdown Signals:** Listens for `SIGTERM` and `unhandledRejection` signals to close the database connection gracefully and complete pending HTTP transactions before terminating (`delayedExit` mechanism).
- **DNS Resiliency Fix:** Integrates Cloudflare/Google DNS servers (`1.1.1.1` and `8.8.8.8`) at startup to fix Indian ISP DNS lookup failures when connecting to MongoDB Atlas.

---

## 📁 Directory Structure

The repository follows a clean, modular **Separation of Concerns (SoC)** layout:

```text
├── src/
│   ├── config/              # External library & service configurations
│   │   ├── corsConfig.ts    # CORS policy configuration
│   │   ├── rateLimiter.ts   # API limiters (global & endpoint-specific)
│   │   ├── logger.ts        # Core Pino logger configuration (multi-target, redaction)
│   │   ├── env.ts           # Env validation, loading, type-safety check, and frozen exports
│   │   └── db.ts            # MongoDB / Mongoose connection handler
│   ├── constants/           # Immutable, application-wide constants (frozen with Object.freeze)
│   │   └── index.ts         # Frozen magic numbers, limits, and standard error messages
│   ├── controllers/         # Handles actual request-response business logic
│   │   └── healthController.ts # API health status controller (uptime, memory metrics)
│   ├── middlewares/         # Express custom middlewares
│   │   ├── index.ts         # Middleware Barrel file
│   │   ├── requestLogger.ts # Pino-HTTP config and log serializer
│   │   └── errorHandlers.ts # 404 (Not Found) and Global Error controllers
│   ├── routes/              # Express API routing tables (Traffic Police)
│   │   ├── index.ts         # API Root router (versions v1 routing)
│   │   └── health.ts        # Health routes
│   ├── utils/               # Shared helper functions and base error classes
│   │   └── AppError.ts      # Base custom operational error class
│   ├── app.ts               # Application wiring, parsing, and pipeline mounting
│   └── server.ts            # Server entry point (Exceptions capture & startup)
├── logs/                    # Local storage for application logs (gitignored)
│   └── app.log              # Raw JSON production logs
├── .env                     # Local configuration environment secrets (gitignored)
├── .env.example             # Template file for environment configurations
├── package.json             # Scripts & dependency definitions
└── tsconfig.json            # TypeScript compiler configuration



---

## 🛠️ Getting Started

### 1. Prerequisites

* Node.js (v18.x or higher)


* npm or yarn


* A running MongoDB instance (local or Atlas)



### 2. Installation

Clone this template and install dependencies:

```bash
git clone [https://github.com/monukd01dev/ts-express-pino-secure-boilerplate.git](https://github.com/monukd01dev/ts-express-pino-secure-boilerplate.git)
cd ts-express-pino-secure-boilerplate
npm install

```

### 3. Environment Setup

Copy the example environment file and configure your values:

```bash
cp env.example .env

```

Open `.env` and fill in your credentials:

```env
PORT=3000
NODE_ENV=development
DB_URI=mongodb://127.0.0.1:27017/my_app
JWT_SECRET=super_secret_key_change_me_in_prod
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:3000

```

### 4. Running the App

**Development Mode** (Hot-reloads using `tsx` with beautiful console logs):

```bash
npm run dev

```

**Production Mode** (Builds TS to JS and runs optimized for performance):

```bash
npm run build
npm run start

```

---

## 🔒 Security & Middleware Order

The order of execution in the middleware pipeline is critical to application security. This boilerplate implements the following standard sequence in `src/app.ts`:

1. **Phase 1: Pre-requisites & Proxies** — Trust hosting proxies (`app.set('trust proxy', 1)`) to read user IPs behind Cloudflare/Render/Nginx.


2. **Phase 2: Security & Protection** — Mount `helmet()` and `cors()` immediately to reject unauthorized origins and attach security headers before any parsing occurs.


3. **Phase 3: Rate Limiting** — Reject flood requests (`globalLimiter`) before wasting CPU cycles parsing heavy request payloads.


4. **Phase 4: Browser Noise Reduction** — Silently discard `/favicon.ico` and `.well-known` browser automated requests using a `204 No Content` response to prevent log pollution.
5. **Phase 5: Logging** — Mount the custom structured `requestLogger` to log incoming validated traffic.


6. **Phase 6: Parsing** — Load body parsers (`express.json()`, `express.urlencoded()`) and `cookieParser()`. Payloads are restricted strictly to secure limits (e.g. `10kb` max payload) to prevent server-flooding memory crashes.


7. **Phase 7: Routes** — Dispatch requests to API routing tables (`/api/v1`).


8. **Phase 8: Fallback & Errors** — Hit `notFoundHandler` (404) if no routes match, and finally route exceptions into the central `globalErrorHandler` (500).



---

## 📡 API Endpoints

### Health Check

* **Endpoint:** `GET /api/v1/health`

* **Purpose:** Monitor server health, uptime, and resource usage. Includes raw numerical data for automated log collectors (Kubernetes/AWS) and clear human-readable statistics.


* **Sample Success Response (`200 OK`):**

```json
{
  "success": true,
  "message": "Server is Up and Running!!",
  "data": {
    "uptime_seconds": 300,
    "uptime_human": "5 minutes",
    "memory_usage_mb": 45,
    "timestamp": "2026-09-06T12:00:00.000Z",
    "environment": "development"
  },
  "error": null
}

```

---

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

