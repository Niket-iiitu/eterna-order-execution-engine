# 🚀 Eterna Order Execution Engine

A **real-time order execution engine** built with **Next.js, BullMQ, Redis, and WebSockets**, designed to simulate high-frequency **DEX order routing and execution** with live status updates.

This project demonstrates how modern trading systems handle **asynchronous order processing**, **best-price routing**, and **real-time client notifications**.

---

## 📌 Key Features

- ⚡ Asynchronous Order Processing using **BullMQ**
- 🔁 Concurrent execution (up to 10 orders in parallel)
- 📡 Real-time order status updates via **WebSockets**
- 🔍 Best-price DEX routing (Raydium vs Meteora)
- 🧠 Decoupled API & Worker architecture
- 🐳 Redis running via Docker
- 📄 Swagger API documentation
- 🧪 Production-ready and fault-tolerant design


---
## 🧩 Tech Stack

| Layer | Technology |
|-----|------------|
| API Server | Next.js (Custom Node Server) |
| Queue | BullMQ |
| Cache / Broker | Redis |
| Real-time Updates | WebSocket (`ws`) |
| Language | TypeScript |
| Documentation | Swagger |
| Infra | Docker |

---

## 🧠 Why `snipeOrder` for Order Processing?

### What is `snipeOrder`?

`snipeOrder` is a **latency-sensitive execution strategy** where orders are executed **immediately** when the best available price is detected across multiple DEXs.

---

### Why it was chosen

- 🚀 **Low latency execution**
- 💰 **Captures best available price**
- ⚡ Ideal for high-frequency trading scenarios
- 🔄 Naturally maps to real-time state transitions
- 📡 Works perfectly with WebSocket-based updates

---

## 📡 Order Lifecycle
pending → routing → building → submitted → confirmed


| State | Description |
|-----|------------|
| `pending` | Order accepted and queued |
| `routing` | Fetching DEX quotes |
| `building` | Preparing transaction |
| `submitted` | Transaction broadcasted |
| `confirmed` | Swap confirmed |
| `failed` | Order execution failed |

---

## 🧪 Concurrency & Reliability

- Worker concurrency set to **10**
- BullMQ provides:
    - Job locking
    - Retry handling
    - Failure isolation
- Redis ensures durability across crashes and restarts

---

## ⚙️ Setup Instructions

### 1️⃣ Start Redis using Docker

```bash
docker run -d --name redis -p 6379:6379 redis
```
## 📌 Sample API Request

Use the following `curl` command to place an order for execution:

```bash
curl -X POST http://localhost:3000/api/orders/execute \
  -H "Content-Type: application/json" \
  -d '{
    "tokenIn": "SOL",
    "tokenOut": "USDC",
    "amount": 1,
    "slippage": 0.5
  }'
