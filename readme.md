# Persona-Engine: Real-Time Event Analytics & CDP

An enterprise-grade, event-driven Customer Data Platform (CDP) and Analytics Engine. This system ingests high-volume user events, processes them asynchronously via background workers, and streams live metrics to a custom Glassmorphism React dashboard using WebSockets.



## System Architecture

Persona-Engine is built on a robust, fault-tolerant microservices architecture:

* **Ingestion Layer (NestJS):** A lightning-fast API Gateway that receives incoming events, broadcasts them to connected clients via WebSockets, and pushes the raw payload to a Redis queue.
* **Message Broker (Redis):** Acts as the system's nervous system, handling the high-speed `event_stream` queue and acting as a Pub/Sub bridge for live frontend alerts.
* **Event Worker (Node.js):** A background service that pulls from Redis, calculates user revenue and churn risk, updates NoSQL profiles, and safely routes bad data to a Dead Letter Queue (DLQ).
* **Batch Worker (Cron):** A scheduled task that aggregates millions of raw MongoDB events and mathematically flattens them into pristine PostgreSQL tables for instant dashboard querying.

##  Tech Stack

**Frontend (The Dashboard)**
* React 18 (Vite)
* Socket.IO-Client (Real-time data streaming)
* Three.js / Postprocessing (Interactive PixelBlast background Made By [ReactBits](https://reactbits.dev))
* Custom Glassmorphism CSS UI

**Backend (The Engine)**
* NestJS & TypeScript
* Docker & Docker Compose
* **MongoDB:** Source of truth for unstructured raw events and dynamic user profiles.
* **PostgreSQL:** Highly structured relational database for batch analytics.
* **Redis:** High-speed queueing and Pub/Sub WebSocket broadcasting.

##  Core Features

* ** Live Event Stream:** WebSockets push incoming user actions (purchases, page views) to the UI in milliseconds.
* ** Dead Letter Queue (DLQ):** Fault-tolerant error handling catches toxic payloads (e.g., missing user IDs), prevents worker crashes, and alerts the UI instantly via Redis Pub/Sub.
* ** Multi-Database Analytics:** Combines real-time MongoDB `.countDocuments()` aggregations with nightly PostgreSQL relational data for optimal UI performance.
* ** Dynamic Profile Tracking:** Instantly searches user IDs to display dynamically updated total revenue, assigned segments, and calculated Churn Risk.
* ** Feature Flag System:** Real-time toggle switches to enable/disable specific platform features based on user segmentation.

## Getting Started

### Prerequisites
Make sure you have [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) installed on your machine.

### Installation

1.**Clone the repository:**
   ```bash
   git clone [https://github.com/yourusername/persona-engine.git](https://github.com/yourusername/persona-engine.git)
   cd persona-engine

2.Set up your environment variables:
    Create a .env file in the backend directory with your database connection strings:

    MONGO_URL=mongodb://mongo:27017/persona
    POSTGRES_USER=postgres
    POSTGRES_PASSWORD=postgres
    POSTGRES_DB=persona
    REDIS_URL=redis://redis:6379

3.Spin up the Docker containers:
    docker compose up -d --build

4.Run the React Dashboard:
    Open a new terminal, navigate to your frontend folder, and start Vite:

    cd persona-dashboard
    npm install
    npm run dev

API Usage Example

To simulate a user action and watch it hit the dashboard in real-time, send a POST request to the API:

POST http://localhost:3000/api/events
JSON

{
  "userId": "u100",
  "type": "purchase",
  "data": { 
    "orderId": "ORD-999", 
    "amount": 150000,
    "category": "laptop"
  },
  "timestamp": 1710000000000
}

Designed and engineered by Arjun.

