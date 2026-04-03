# Authorizer — Project Specification

> Version: 1.0  
> Status: In definition  
> Type: Full-stack — CLI Backend + React Frontend (Portfolio)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Design Principles](#2-design-principles)
3. [Backend — CLI Authorizer](#3-backend--cli-authorizer)
   - 3.1 [Description](#31-description)
   - 3.2 [Operations](#32-operations)
   - 3.3 [Business Rules](#33-business-rules)
   - 3.4 [Internal State](#34-internal-state)
   - 3.5 [Error Handling](#35-error-handling)
   - 3.6 [Architecture and File Structure](#36-architecture-and-file-structure)
   - 3.7 [Edge Cases](#37-edge-cases)
   - 3.8 [Testing](#38-testing)
   - 3.9 [I/O Examples](#39-io-examples)
4. [Frontend — Bank Dashboard](#4-frontend--bank-dashboard)
   - 4.1 [Description](#41-description)
   - 4.2 [Tech Stack](#42-tech-stack)
   - 4.3 [Layout and Components](#43-layout-and-components)
   - 4.4 [Architecture and File Structure](#44-architecture-and-file-structure)
   - 4.5 [Required Features](#45-required-features)
   - 4.6 [Standout Features (Portfolio)](#46-standout-features-portfolio)
   - 4.7 [Visual Design](#47-visual-design)
5. [Frontend ↔ Backend Relationship](#5-frontend--backend-relationship)
6. [Required README](#6-required-readme)
7. [Evaluation Criteria](#7-evaluation-criteria)

---

## 1. Overview

The **Authorizer** project is a bank transaction authorization system. Its goal is to decide in real time whether a transaction should be approved or rejected based on a set of predefined business rules.

The project is composed of two independent but conceptually connected parts:

| Part | Description | Purpose |
|---|---|---|
| **Backend** | CLI application that receives operations via `stdin` and emits results via `stdout` | Fulfill the original technical challenge |
| **Frontend** | Interactive React dashboard that visualizes the authorizer in real time | Visual demo for portfolio |

Both parts share the **same domain logic**. The authorizer core must be framework-agnostic: reusable in both Node.js (CLI) and React (browser).

---

## 2. Design Principles

All project code, both backend and frontend, must strictly adhere to the following principles.

### SOLID

| Principle | Application in this project |
|---|---|
| **S** — Single Responsibility | Each module/class/function has a single reason to change. Validators, state, and parser are separate modules. |
| **O** — Open/Closed | The validation system must be open for extension (adding new rules) without modifying existing code. |
| **L** — Liskov Substitution | Abstractions must be substitutable. A new validator must be able to replace or be added to the pipeline without breaking anything. |
| **I** — Interface Segregation | Do not force unnecessary dependencies. State should know nothing about validators, and vice versa. |
| **D** — Dependency Inversion | High-level modules (handler) should not depend on low-level ones (concrete validators), but on abstractions. |

### KISS — Keep It Simple, Stupid
- Do not add unnecessary frameworks, layers, or abstractions.
- If something can be solved with the stdlib, use it.
- Code must be readable without the need for extensive comments.

### DRY — Don't Repeat Yourself
- Business rule logic exists in **one place only**: the core.
- The frontend does not reimplement rules; it consumes the core.

### Referential Transparency
- Validator functions must be **pure functions**: given the same input, they always produce the same output with no side effects.
- Mutable state is isolated in a single layer (the Store/State).

### Separation of Concerns
- Parsing, validation, state, and presentation are completely separate responsibilities.
- The frontend is unaware of CLI details and vice versa.

---

## 3. Backend — CLI Authorizer

### 3.1 Description

A command-line application written in **Python 3.11+** that processes a stream of JSON operations from `stdin` and emits one JSON result per processed line to `stdout`.

**Execution:**
```bash
$ python src/main.py < operations
```

Where `operations` is a file with one JSON operation per line.

**Constraints:**
- No external database. In-memory only.
- State resets when the application starts.
- Monetary values are positive integers (no cents).
- Transactions arrive in chronological order.
- No need to handle parsing errors (input is always valid).

---

### 3.1.1 Python Stack

| Tool | Purpose | Source |
|---|---|---|
| `sys` | Read from `stdin`, write to `stdout` | stdlib |
| `json` | Parse and serialize JSON | stdlib |
| `datetime` | Parse ISO 8601 timestamps, compute time deltas | stdlib |
| `dataclasses` | Define `Account` and `Transaction` as typed data structures | stdlib |
| `typing` | Type hints (`Optional`, `List`) for clarity and tooling support | stdlib |
| `pytest` | Unit and integration test runner | third-party |
| `pytest-cov` | Test coverage reports | third-party |

> The entire backend relies only on the Python stdlib plus `pytest` for testing. No application frameworks (Flask, FastAPI, Django, etc.) are needed or allowed.

---

### 3.2 Operations

The program handles exactly **two types of operation**, determined by the root key of the JSON:

#### Operation 1: Account Creation

**Input:**
```json
{"account": {"active-card": true, "available-limit": 100}}
```

**Output (success):**
```json
{"account": {"active-card": true, "available-limit": 100}, "violations": []}
```

**Output (violation):**
```json
{"account": {"active-card": true, "available-limit": 100}, "violations": ["account-already-initialized"]}
```

#### Operation 2: Transaction Authorization

**Input:**
```json
{"transaction": {"merchant": "Burger King", "amount": 20, "time": "2019-02-13T10:00:00.000Z"}}
```

**Output (success):**
```json
{"account": {"active-card": true, "available-limit": 80}, "violations": []}
```

**Output (violation):**
```json
{"account": {"active-card": true, "available-limit": 80}, "violations": ["insufficient-limit"]}
```

**Output (no account):**
```json
{"account": {}, "violations": ["account-not-initialized"]}
```

---

### 3.3 Business Rules

#### Account Creation Rules

| ID | Description | Violation |
|---|---|---|
| AC-01 | Only one account can be created. If one already exists, the operation is rejected. | `account-already-initialized` |

#### Transaction Rules

| ID | Description | Violation |
|---|---|---|
| TR-01 | An initialized account must exist. | `account-not-initialized` |
| TR-02 | The account card must be active. | `card-not-active` |
| TR-03 | The transaction amount must not exceed the available limit. | `insufficient-limit` |
| TR-04 | No more than 3 **approved** transactions within a 2-minute interval. | `high-frequency-small-interval` |
| TR-05 | No more than 1 transaction with the same `merchant` and `amount` within a 2-minute interval. | `doubled-transaction` |

> **Note on extensibility:** The system must be designed so that adding a new rule (e.g. TR-06) only requires implementing a new validator function and registering it, without modifying the existing pipeline.

#### Behavior on Multiple Violations

If a transaction violates more than one rule, **all violations** must be reported in the same output:

```json
{"account": {"active-card": true, "available-limit": 65}, "violations": ["insufficient-limit", "high-frequency-small-interval"]}
```

---

### 3.4 Internal State

The application state is an in-memory object with the following shape:

```
State {
  account: Account | null
  transactions: ApprovedTransaction[]
}

Account {
  active-card: boolean
  available-limit: integer
}

ApprovedTransaction {
  merchant: string
  amount: integer
  time: DateTime
}
```

**Critical state rule:**
> Operations that result in violations **are NOT persisted** to the state. Only approved transactions are saved to the history.

This means:
- A transaction rejected due to `insufficient-limit` does not count toward `high-frequency-small-interval`.
- A transaction rejected due to `doubled-transaction` does not count as a previous transaction.

---

### 3.5 Error Handling

- Input will always be valid, well-formed JSON. Parsing errors do not need to be handled.
- Business rule violations **are not errors**; they are expected outcomes. Program execution continues normally after any violation.
- For every operation (approved or rejected), exactly one line of output is always emitted.

---

### 3.6 Architecture and File Structure

The architecture follows a **layered pattern with strict separation of concerns**:

```
backend/
├── src/
│   ├── main.py              ← Entry point: reads stdin, calls handler, prints stdout
│   ├── parser.py            ← JSON string → typed operation (dict)
│   ├── serializer.py        ← State + violations → JSON output string
│   │
│   ├── core/
│   │   ├── models.py        ← Dataclasses: Account, Transaction, State
│   │   ├── state.py         ← Store: manages Account and transaction history
│   │   ├── authorizer.py    ← Orchestrator: decides which operation to process
│   │   ├── account.py       ← Account operation handler
│   │   └── transaction.py   ← Transaction operation handler
│   │
│   └── validators/
│       ├── __init__.py                       ← Exports the validation pipeline
│       ├── account_already_initialized.py    ← Rule AC-01
│       ├── account_not_initialized.py        ← Rule TR-01
│       ├── card_not_active.py                ← Rule TR-02
│       ├── insufficient_limit.py             ← Rule TR-03
│       ├── high_frequency_small_interval.py  ← Rule TR-04
│       └── doubled_transaction.py            ← Rule TR-05
│
├── tests/
│   ├── __init__.py
│   ├── unit/
│   │   ├── __init__.py
│   │   ├── validators/
│   │   │   ├── __init__.py
│   │   │   ├── test_account_already_initialized.py
│   │   │   ├── test_account_not_initialized.py
│   │   │   ├── test_card_not_active.py
│   │   │   ├── test_insufficient_limit.py
│   │   │   ├── test_high_frequency_small_interval.py
│   │   │   └── test_doubled_transaction.py
│   │   └── test_state.py
│   └── integration/
│       ├── __init__.py
│       └── test_authorizer.py
│
├── requirements.txt         ← pytest, pytest-cov
└── README.md
```

**Data flow:**

```
stdin
  ↓
parser.py         → { type: 'account' | 'transaction', payload: dict }
  ↓
authorizer.py     → decides which handler to call
  ↓
account.py        → applies account validators → updates state
transaction.py    → applies transaction validators → updates state
  ↓
serializer.py     → { account, violations } → JSON string
  ↓
stdout
```

---

### 3.7 Edge Cases

The following cases must be handled correctly and covered by tests:

| Case | Description |
|---|---|
| Transaction before account creation | Must return `account-not-initialized` with `"account": {}` |
| Creating account twice | Second creation returns `account-already-initialized`, account remains unchanged |
| Rejected transactions don't affect the frequency window | 3 rejected txns + 1 valid one must not trigger `high-frequency-small-interval` |
| The 2-minute window is sliding | Measured from the `time` of the current transaction, not from the start |
| Multiple simultaneous violations | All are reported together in the same array |
| Account with inactive card | Account is valid; transactions are rejected with `card-not-active` |
| Transaction that exactly exhausts the balance | Must be approved (limit >= amount) |

---

### 3.8 Testing

Two levels of tests are required:

#### Unit Tests
One test per business rule, isolating each validator function:

- `test_account_already_initialized.py`
- `test_account_not_initialized.py`
- `test_card_not_active.py`
- `test_insufficient_limit.py`
- `test_high_frequency_small_interval.py`
- `test_doubled_transaction.py`

#### Integration Tests
Complete multi-operation flows, using the spec examples as base cases, plus the edge cases from section 3.7.

---

### 3.9 I/O Examples

#### Happy path

```
# Input
{"account": {"active-card": true, "available-limit": 100}}
{"transaction": {"merchant": "Burger King", "amount": 20, "time": "2019-02-13T11:00:00.000Z"}}

# Output
{"account": {"active-card": true, "available-limit": 100}, "violations": []}
{"account": {"active-card": true, "available-limit": 80}, "violations": []}
```

#### Violation: insufficient limit

```
# Input
{"account": {"active-card": true, "available-limit": 1000}}
{"transaction": {"merchant": "Vivara", "amount": 1250, "time": "2019-02-13T11:00:00.000Z"}}
{"transaction": {"merchant": "Nike", "amount": 800, "time": "2019-02-13T11:01:01.000Z"}}

# Output
{"account": {"active-card": true, "available-limit": 1000}, "violations": []}
{"account": {"active-card": true, "available-limit": 1000}, "violations": ["insufficient-limit"]}
{"account": {"active-card": true, "available-limit": 200}, "violations": []}
```

#### Violation: high frequency

```
# Input
{"account": {"active-card": true, "available-limit": 100}}
{"transaction": {"merchant": "Burger King", "amount": 20, "time": "2019-02-13T11:00:00.000Z"}}
{"transaction": {"merchant": "Habbib's", "amount": 20, "time": "2019-02-13T11:00:01.000Z"}}
{"transaction": {"merchant": "McDonald's", "amount": 20, "time": "2019-02-13T11:01:01.000Z"}}
{"transaction": {"merchant": "Subway", "amount": 20, "time": "2019-02-13T11:01:31.000Z"}}
{"transaction": {"merchant": "Burger King", "amount": 10, "time": "2019-02-13T12:00:00.000Z"}}

# Output
{"account": {"active-card": true, "available-limit": 100}, "violations": []}
{"account": {"active-card": true, "available-limit": 80}, "violations": []}
{"account": {"active-card": true, "available-limit": 60}, "violations": []}
{"account": {"active-card": true, "available-limit": 40}, "violations": []}
{"account": {"active-card": true, "available-limit": 40}, "violations": ["high-frequency-small-interval"]}
{"account": {"active-card": true, "available-limit": 30}, "violations": []}
```

#### Multiple violations

```
# Input
{"account": {"active-card": true, "available-limit": 100}}
{"transaction": {"merchant": "McDonald's", "amount": 10, "time": "2019-02-13T11:00:01.000Z"}}
{"transaction": {"merchant": "Burger King", "amount": 20, "time": "2019-02-13T11:00:02.000Z"}}
{"transaction": {"merchant": "Burger King", "amount": 5, "time": "2019-02-13T11:00:07.000Z"}}
{"transaction": {"merchant": "Burger King", "amount": 5, "time": "2019-02-13T11:00:08.000Z"}}
{"transaction": {"merchant": "Burger King", "amount": 150, "time": "2019-02-13T11:00:18.000Z"}}
{"transaction": {"merchant": "Burger King", "amount": 190, "time": "2019-02-13T11:00:22.000Z"}}
{"transaction": {"merchant": "Burger King", "amount": 15, "time": "2019-02-13T12:00:27.000Z"}}

# Output
{"account":{"active-card":true,"available-limit":100},"violations":[]}
{"account":{"active-card":true,"available-limit":90},"violations":[]}
{"account":{"active-card":true,"available-limit":70},"violations":[]}
{"account":{"active-card":true,"available-limit":65},"violations":[]}
{"account":{"active-card":true,"available-limit":65},"violations":["high-frequency-small-interval","doubled-transaction"]}
{"account":{"active-card":true,"available-limit":65},"violations":["insufficient-limit","high-frequency-small-interval"]}
{"account":{"active-card":true,"available-limit":65},"violations":["insufficient-limit","high-frequency-small-interval"]}
{"account":{"active-card":true,"available-limit":50},"violations":[]}
```

#### Rejected transactions do not affect the frequency history

```
# Input
{"account": {"active-card": true, "available-limit": 1000}}
{"transaction": {"merchant": "Vivara", "amount": 1250, "time": "2019-02-13T11:00:00.000Z"}}
{"transaction": {"merchant": "Samsung", "amount": 2500, "time": "2019-02-13T11:00:01.000Z"}}
{"transaction": {"merchant": "Nike", "amount": 800, "time": "2019-02-13T11:01:01.000Z"}}
{"transaction": {"merchant": "Uber", "amount": 80, "time": "2019-02-13T11:01:31.000Z"}}

# Output
{"account": {"active-card": true,"available-limit": 1000}, "violations": []}
{"account": {"active-card": true,"available-limit": 1000}, "violations": ["insufficient-limit"]}
{"account": {"active-card": true,"available-limit": 1000}, "violations": ["insufficient-limit"]}
{"account": {"active-card": true,"available-limit": 200}, "violations": []}
{"account": {"active-card": true,"available-limit": 120}, "violations": []}
```

---

## 4. Frontend — Bank Dashboard

### 4.1 Description

An interactive web application built in React that allows users to visualize and operate the authorizer visually. Designed as a portfolio piece: anyone (technical or not) should be able to understand the system just by interacting with it.

**Core principle:** The frontend **does not reimplement** the authorizer logic. It imports and consumes the `core/` directly from the backend (which is framework-agnostic). There is a single source of truth for business rules.

---

### 4.2 Tech Stack

| Tool | Purpose |
|---|---|
| **React 18** | UI framework |
| **Vite** | Build tool and dev server |
| **Tailwind CSS** | Utility-first styling |
| **Framer Motion** | Animations and transitions |
| **Lucide React** | Iconography |
| **Vercel** | Deployment (free) |

---

### 4.3 Layout and Components

```
┌─────────────────────────────────────────────────────────────┐
│  💳 Authorizer Dashboard                       [Reset] [?]  │
├───────────────────────┬─────────────────────────────────────┤
│                       │                                     │
│  ┌─────────────────┐  │  TRANSACTION LOG                    │
│  │  ACCOUNT CARD   │  │  ┌─────────────────────────────┐   │
│  │  $1,000         │  │  │ ✅ Burger King   -$20  $980 │   │
│  │  ● Active       │  │  │ ❌ Vivara    insufficient-.. │   │
│  └─────────────────┘  │  │ ✅ Nike          -$80  $900 │   │
│                       │  └─────────────────────────────┘   │
│  NEW TRANSACTION      │                                     │
│  ┌─────────────────┐  │  TIME WINDOW VISUALIZER            │
│  │ Merchant  [   ] │  │  ┌─────────────────────────────┐   │
│  │ Amount    [   ] │  │  │  ←—— 2 min window ——→       │   │
│  │ Time      [   ] │  │  │  [txn1] [txn2]  [txn3]      │   │
│  │                 │  │  │   3/3 — next one: at risk ⚠️ │   │
│  │ [  Authorize  ] │  │  └─────────────────────────────┘   │
│  └─────────────────┘  │                                     │
│                       │  VIOLATIONS PANEL                   │
│  [Raw JSON Mode]      │  ┌─────────────────────────────┐   │
│  [Load Scenario ▾]    │  │ 🔴 high-frequency-small-... │   │
│                       │  │ 🔴 insufficient-limit       │   │
└───────────────────────┴──┴─────────────────────────────────┘
```

---

### 4.4 Architecture and File Structure

```
frontend/
├── src/
│   ├── core/                         ← Pure logic (shared with backend)
│   │   ├── state.js
│   │   ├── authorizer.js
│   │   ├── account.js
│   │   ├── transaction.js
│   │   └── validators/
│   │       ├── index.js
│   │       ├── accountAlreadyInitialized.js
│   │       ├── accountNotInitialized.js
│   │       ├── cardNotActive.js
│   │       ├── insufficientLimit.js
│   │       ├── highFrequencySmallInterval.js
│   │       └── doubledTransaction.js
│   │
│   ├── hooks/
│   │   └── useAuthorizer.js          ← Connects core with React state
│   │
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Header.jsx
│   │   │   └── TwoColumnLayout.jsx
│   │   ├── Account/
│   │   │   ├── AccountCard.jsx       ← Visual card with balance and status
│   │   │   └── CreateAccountForm.jsx
│   │   ├── Transaction/
│   │   │   ├── TransactionForm.jsx   ← New transaction form
│   │   │   └── RawJsonEditor.jsx     ← JSON editor for advanced mode
│   │   ├── Log/
│   │   │   ├── TransactionLog.jsx    ← Animated operations feed
│   │   │   └── LogEntry.jsx          ← Individual log item
│   │   ├── Violations/
│   │   │   ├── ViolationPanel.jsx    ← Violations panel for latest operation
│   │   │   └── ViolationBadge.jsx    ← Badge per violation type
│   │   ├── Visualizer/
│   │   │   └── TimeWindowViz.jsx     ← Visual bar for the 2-min window
│   │   └── Scenarios/
│   │       └── ScenarioLoader.jsx    ← Predefined scenarios dropdown
│   │
│   ├── data/
│   │   └── scenarios.js              ← Spec examples hardcoded
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── index.html
├── vite.config.js
├── tailwind.config.js
└── README.md
```

---

### 4.5 Required Features

| ID | Feature | Description |
|---|---|---|
| FE-01 | Create account | Form to initialize account with `active-card` and `available-limit` |
| FE-02 | Authorize transaction | Form with `merchant`, `amount`, and `time` (default: now) |
| FE-03 | Transaction Log | Real-time feed of all operations, approved and rejected |
| FE-04 | Account state | Live display of balance and card active/inactive status |
| FE-05 | Violations panel | Shows violations from the most recent operation |
| FE-06 | Reset | Clears the full state and returns to initial state |

---

### 4.6 Standout Features (Portfolio)

These features go beyond the minimum and are what make the project memorable:

#### FE-07: Raw JSON Mode
A toggle that switches the visual form to a plain text editor where JSON lines can be pasted directly, just like the CLI. This demonstrates mastery of the original technical spec.

```
[Form Mode] ←→ [Raw JSON Mode]

# Raw JSON Mode
┌─────────────────────────────────────────┐
│ {"transaction": {"merchant": "BK", ... │
│                                         │
│                          [Run ▶]        │
└─────────────────────────────────────────┘
```

#### FE-08: Time Window Visualizer
A visual representation of the sliding 2-minute window. Shows recent approved transactions as blocks on a timeline, indicating how many are currently active and whether the next transaction would be at risk of triggering `high-frequency-small-interval`.

#### FE-09: Predefined Scenarios
A dropdown with spec example cases loadable with a single click:
- ✅ Happy path
- ❌ Insufficient limit
- ❌ High frequency
- ❌ Doubled transaction
- ❌ Multiple violations
- 🧪 Rejected transactions don't affect history

Allows recruiters and visitors to explore the system's behavior without having to type anything.

#### FE-10: Feedback Animations
- Slide+fade entrance for each new log item
- Shake animation on the AccountCard when violations occur
- Color transition on the available balance (green → yellow → red based on remaining percentage)

---

### 4.7 Visual Design

#### Aesthetic
The design follows a **fintech dark** aesthetic — executive dashboard feel, monospaced typography for numeric values, dark palette with subtle neon accents. Conveys confidence and technical precision.

#### Color Palette
```
Background:    #0a0e1a  (dark navy)
Surface:       #111827  (card background)
Border:        #1f2937  (subtle dividers)
Primary:       #3b82f6  (blue — primary actions)
Success:       #10b981  (green — approved transactions)
Error:         #ef4444  (red — rejected transactions)
Warning:       #f59e0b  (amber — frequency warnings)
Text primary:  #f9fafb
Text muted:    #6b7280
Font numbers:  JetBrains Mono / IBM Plex Mono
Font UI:       Geist / DM Sans
```

#### Responsive
The application must be usable on desktop (two-column layout) and mobile (single column, log below the form).

---

## 5. Frontend ↔ Backend Relationship

Both parts of the project are independent but share the core logic conceptually. There is no REST API between them — the frontend executes its own JavaScript port of the core logic directly in the browser.

```
project-root/
├── backend/          ← Python CLI
│   └── src/
│       └── core/     ← Authorizer logic in Python
│
├── frontend/         ← React App
│   └── src/
│       └── core/     ← JavaScript port of the same logic
│
└── README.md
```

> **Design decision:** Since the backend is Python and the frontend is React (JavaScript), the `core/` cannot be shared as a single file. Instead, the frontend contains a faithful **JavaScript port** of the Python core. Both implementations must produce identical outputs for identical inputs. The business rules are defined once in the Python backend — the JS version mirrors them exactly.

---

## 6. Required README

The project must include a `README.md` at the root with the following sections:

1. **Description** — What the project does and why
2. **Technical and architectural decisions** — Why the language/stack was chosen, why that structure
3. **Applied principles** — How SOLID, KISS, DRY, etc. were applied with concrete code examples
4. **How to run the backend**
   ```bash
   cd backend
   pip install -r requirements.txt
   python src/main.py < operations.txt
   # Or inline:
   echo '{"account": {"active-card": true, "available-limit": 100}}' | python src/main.py
   ```
5. **How to run the frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
6. **How to run the tests**
   ```bash
   cd backend
   pytest
   # With coverage:
   pytest --cov=src
   ```
7. **Additional notes** — Edge cases discovered, possible future extensions

---

## 7. Evaluation Criteria

### Functional
- [ ] All spec I/O examples produce the correct output
- [ ] Edge cases from section 3.7 are covered and working
- [ ] The frontend faithfully reflects the backend behavior

### Code Quality
- [ ] Each validator is a pure function (referential transparency)
- [ ] Adding a new rule does not require modifying the orchestrator
- [ ] No business logic inside React components
- [ ] Mutable state is isolated in a single layer

### Testing
- [ ] One unit test per business rule
- [ ] Integration tests for all spec flows
- [ ] Integration tests for edge cases

### Frontend (portfolio)
- [ ] The UI is functional and intuitive without reading documentation
- [ ] Raw JSON Mode works correctly
- [ ] Predefined scenarios load and run correctly
- [ ] The Time Window Visualizer is accurate
- [ ] The design is responsive

### Documentation
- [ ] Complete README with execution instructions
- [ ] Architectural decisions justified
- [ ] No personal information in any file
