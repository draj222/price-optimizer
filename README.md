# Price Optimizer

A modern price optimization tool with FastAPI backend and Next.js frontend.

## Backend (FastAPI)

```bash
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt  # or install dependencies manually
uvicorn main:app --reload --port 8000
```

- Health check: [http://localhost:8000/health](http://localhost:8000/health)

## Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

- App: [http://localhost:3000](http://localhost:3000)

## Tooling
- Python: black, isort, pytest
- Node: eslint, prettier, shadcn/ui, Tailwind CSS
- Pre-commit hooks: see `.pre-commit-config.yaml`

## Testing

### Backend

```bash
cd backend
PYTHONPATH=. pytest
```

### Frontend

```bash
cd frontend
npm run test
```
