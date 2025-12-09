Persona Engine

A real-time personalization and analytics backend built with NestJS, Redis Streams, MongoDB Replica Set, and Postgres.
The system ingests user events, updates behavioral profiles, evaluates triggers, runs ML-based churn scoring, supports feature flags & A/B tests, and generates daily analytics.


Includes:

Event-driven pipeline (API → Redis → Worker → Mongo)

User profile engine (affinity, churn, segmentation)

Trigger engine (rule-based automations)

Replay engine for historical reprocessing

Feature flags + experiment framework

ML scoring (lightweight JSON models)

Postgres batch analytics

Distributed correlation IDs

DLQ for failed events

Dockerized infrastructure

Full Swagger API documentation

A production-style backend architecture suitable for learning, demo, or portfolio use.



Getting Started

1.Clone the repo

  git clone https://github.com/<your-username>/persona-engine.git
  cd persona-engine

2.Install dependencies

  npm install

3.Start the full stack (API + DBs + Workers)

  docker compose up --build


