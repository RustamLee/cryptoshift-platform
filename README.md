# CryptoShift Platform: Reactive E-Commerce & FinTech Ecosystem

## 🚀 Overview
**CryptoShift** is an advanced e-commerce platform built on a hybrid architecture. It combines a robust **Bookstore Monolith** for retail operations with a modern, microservice-based **Crypto Payment Gateway**.

The project demonstrates the integration of a legacy Spring Boot application with a reactive, event-driven infrastructure designed to handle cryptocurrency payments while mitigating market volatility.

---

## 🏗 System Architecture

The platform consists of two main architectural layers:

1.  **Core Bookstore (Monolith):**
    *   **Tech:** Java 21, Spring Boot 3, Spring Security (JWT), MySQL.
    *   **Logic:** Manages product catalogs (books, authors, genres), user authentication (Roles: Client, Seller, Admin), shopping carts, and order history.

2.  **CryptoShift Gateway (Microservices Layer):**
    *   **Tech:** Spring Boot, Apache Kafka, Redis, WebSockets.
    *   **Logic:**
        *   **Exchange-Rate Service:** Streams real-time prices from Binance API via WebSockets.
        *   **Payment Orchestrator:** Implements a **Price-Lock** mechanism (15-min fixed rate) using **Spring State Machine**.
        *   **Wallet Watcher:** Monitors blockchain events to confirm incoming transactions.

---

## 🛠 Key Features

*   **JWT Authentication:** Secure access control for different user roles.
*   **Price-Lock Mechanism:** Protects both the merchant and the customer from crypto volatility during checkout.
*   **Event-Driven Communication:** Uses **Apache Kafka** for seamless, decoupled interaction between the store and the payment gateway.
*   **Real-time Monitoring:** Integration with **Prometheus & Grafana** for system health and financial metrics.
*   **Telegram Notifications:** Real-time payment status updates sent directly to the user.

---

## 🧬 Tech Stack


| Layer | Technologies |
| :--- | :--- |
| **Backend** | Java 21, Spring Boot 3, Hibernate/JPA |
| **Frontend** | Angular (Reactive Forms, Interceptors, RxJS) |
| **Messaging** | Apache Kafka |
| **Cache/Real-time**| Redis, WebSockets |
| **Database** | PostgreSQL (Payments), MySQL (Store) |
| **DevOps** | Docker, Docker Compose, GitHub Actions |

---

## 📈 Roadmap

- [x] **Phase 1:** Refactor Legacy Bookstore Core (JWT migration & Service-layer cleanup).
- [ ] **Phase 2:** Implement `Payment-Orchestrator` with Spring State Machine.
- [ ] **Phase 3:** Integration of `Exchange-Rate Service` with Binance WebSocket API.
- [ ] **Phase 4:** Deployment of Kafka cluster for inter-service communication.
- [ ] **Phase 5:** Full containerization with Docker Compose.

---

## ⚙️ Running the Project (Dev Mode)

### Prerequisites
*   Java 21+
*   Node.js & npm
*   Docker & Docker Compose

### Step 1: Launch Infrastructure
```bash
docker-compose up -d
```

### Step 2: Run Backend
```bash
./mvnw spring-boot:run
```

### Step 3: Run Frontend
```bash
cd Frontend/bookstore
npm install && npm start
```

---
*Disclaimer: This project evolved from a collaborative university MVP into a professional-grade microservice ecosystem to demonstrate advanced Backend Engineering and System Design skills.*
