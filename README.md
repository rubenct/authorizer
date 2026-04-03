# Authorizer — Project Specification

> Version: 1.0  
> Status: Complete  
> Type: Full-stack — CLI Backend + React Frontend (Portfolio)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Design Principles](#2-design-principles)
3. [Backend — CLI Authorizer](#3-backend--cli-authorizer)
4. [Frontend — Bank Dashboard](#4-frontend--bank-dashboard)
5. [Frontend ↔ Backend Relationship](#5-frontend--backend-relationship)
6. [How to Run](#6-how-to-run)
7. [Evaluation Criteria](#7-evaluation-criteria)

---

## 1. Overview

The **Authorizer** project is a bank transaction authorization system. Its goal is to decide in real time whether a transaction should be approved or rejected based on a set of predefined business rules.

| Part | Description | Purpose |
|---|---|---|
| **Backend** | CLI application that receives operations via `stdin` and emits results via `stdout` | Fulfill the original technical challenge |
| **Frontend** | Interactive React dashboard that visualizes the authorizer in real time | Visual demo for portfolio |

Both parts share the **same domain logic**. The authorizer core is framework-agnostic: reusable in both Python (CLI) and JavaScript (React).

---

## 2. Design Principles

### SOLID

| Principle | Application in this project |
|---|---|
| **S** — Single Responsibility | Each module/class/function has a single reason to change. Validators, state, and parser are separate modules. |
| **O** — Open/Closed | The validation system is open for extension (adding new rules) without modifying existing code. |
| **L** — Liskov Substitution | Abstractions are substitutable. A new validator can be added to the pipeline without breaking anything. |
| **I** — Interface Segregation | Do not force unnecessary dependencies. State knows nothing about validators, and vice versa. |
| **D** — Dependency Inversion | High-level modules (handler) depend on abstractions, not on concrete validators. |

### KISS — Keep It Simple, Stupid
- Do not add unnecessary frameworks, layers, or abstractions.
- If something can be solved with the stdlib, use it.

### DRY — Don't Repeat Yourself
- Business rule logic exists in **one place only**: the core.
- The frontend does not reimplement rules; it consumes the core.

### Referential Transparency
- Validator functions are **pure functions**: given the same input, they always produce the same output with no side effects.
- Mutable state is isolated in a single layer (the Store/State).

---

## 3. Backend — CLI Authorizer

### 3.1 Description

A command-line application written in **Python 3.11+** that processes a stream of JSON operations from `stdin` and emits one JSON result per processed line to `stdout`.

### Operations

**Account Creation:**
```json
{"account": {"active-card": true, "available-limit": 100}}
```
**Output:** `{"account": {"active-card": true, "available-limit": 100}, "violations": []}`

**Transaction Authorization:**
```json
{"transaction": {"merchant": "Burger King", "amount": 20, "time": "2019-02-13T10:00:00.000Z"}}
```
**Output:** `{"account": {"active-card": true, "available-limit": 80}, "violations": []}`

### Business Rules

| ID | Description | Violation |
|---|---|---|
| AC-01 | Only one account can be created. | `account-already-initialized` |
| TR-01 | An initialized account must exist. | `account-not-initialized` |
| TR-02 | The account card must be active. | `card-not-active` |
| TR-03 | The transaction amount must not exceed the available limit. | `insufficient-limit` |
| TR-04 | No more than 3 approved transactions within a 2-minute interval. | `high-frequency-small-interval` |
| TR-05 | No more than 1 transaction with the same merchant and amount within a 2-minute interval. | `doubled-transaction` |

---

## 4. Frontend — Bank Dashboard

### Tech Stack

| Tool | Purpose |
|---|---|
| **React 18** | UI framework |
| **Vite** | Build tool and dev server |
| **Tailwind CSS** | Utility-first styling |
| **Framer Motion** | Animations and transitions |
| **Lucide React** | Iconography |

### Features

- Account creation with active card and available limit
- Transaction authorization with real-time validation
- Transaction log with slide+fade animations
- Violations panel with badges
- Raw JSON mode (paste operations like CLI)
- Time window visualizer (2-minute sliding window)
- Predefined scenarios loader
- Reset functionality
- Responsive layout (desktop two-column, mobile single)

---

## 5. Frontend ↔ Backend Relationship

Both parts are independent but share the core logic conceptually. There is no REST API between them — the frontend executes its own JavaScript port of the core logic directly in the browser.

```
project-root/
├── backend/          ← Python CLI
│   └── src/
│       └── core/     ← Authorizer logic in Python
│
└── frontend/         ← React App
    └── src/
        └── core/     ← JavaScript port of the same logic
```

---

## 6. How to Run

### Backend

```bash
cd backend
pip install -r requirements.txt

# Run with input file
python src/main.py < examples/operations.txt

# Or inline
echo '{"account": {"active-card": true, "available-limit": 100}}' | python src/main.py

# Run tests
pytest
```

### Frontend

```bash
cd frontend

# Install dependencies (already done)
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The frontend runs on `http://localhost:5173` by default.

---

## 7. Visual Design

### Dark Fintech Aesthetic

The frontend uses a dark theme inspired by executive dashboards:

```
Background:    #0a0e1a  (dark navy)
Surface:       #111827  (card background)
Primary:       #3b82f6  (blue)
Success:       #10b981  (green)
Error:         #ef4444  (red)
Warning:       #f59e0b  (amber)
Text Primary:  #f9fafb
Text Muted:    #6b7280
```

### Features Implemented

- **Account card** with balance and progress bar
- **Shake animation** on violations
- **Slide+fade** entrance for log entries
- **Time Window Visualizer** showing the 2-minute sliding window
- **Color transitions** on balance (green → yellow → red)
- **Dark theme** with monospace typography for numbers

---

## 8. Evaluation Criteria

### Functional
- [x] All spec I/O examples produce the correct output
- [x] Edge cases covered and working
- [x] The frontend faithfully reflects the backend behavior

### Code Quality
- [x] Each validator is a pure function (referential transparency)
- [x] Adding a new rule does not require modifying the orchestrator
- [x] No business logic inside React components
- [x] Mutable state is isolated in a single layer

### Testing
- [x] One unit test per business rule
- [x] Integration tests for all spec flows

### Frontend (portfolio)
- [x] The UI is functional and intuitive without reading documentation
- [x] Raw JSON Mode works correctly
- [x] Predefined scenarios load and run correctly
- [x] The Time Window Visualizer is accurate
- [x] The design is responsive

### Documentation
- [x] Complete README with execution instructions
- [x] Architectural decisions justified

---

**Author:** Ruben Cariño

> Built with React + Python