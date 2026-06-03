# Research Paper Assistant

> AI Quickstart — RAG-powered semantic search, snippet curation, and LLM draft generation for scientists.

## Overview

Scientists ingest PDFs, URLs, and plain text, search semantically over their corpus, curate relevant snippets into a research session, and generate a structured draft report — all on-cluster with no external APIs.

## Stack

- **UI:** React 19, TypeScript, Vite, TanStack Router/Query
- **API:** FastAPI, Python 3.12, SQLAlchemy 2 async
- **Storage:** PostgreSQL 16 + pgvector
- **Models:** `nomic-embed-text` (embedding) + `granite-3.1-8b-instruct` (generation) via vLLM CPU mode
- **Deploy:** Podman Compose (local) + OpenShift AI via Helm

## Quickstart (local)

```bash
cp .env.example .env
make setup
make dev
```

Open http://localhost:3000

## Commands

| Command | Description |
|---------|-------------|
| `make setup` | Install all dependencies |
| `make dev` | Start local stack with podman-compose |
| `make lint` | Run all linters |
| `make test` | Run unit tests |
| `make test-integration` | Run integration tests |
| `make test-e2e` | Run Playwright E2E tests |
| `make deploy` | Deploy to OpenShift AI |

## Architecture

See [data/designs/research-paper-assistant.md](../../data/designs/research-paper-assistant.md) for full design.
