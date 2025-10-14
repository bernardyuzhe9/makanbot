# Python Backend (FastAPI)

## Setup

```bash
python -m venv .venv
. .venv/Scripts/Activate.ps1
pip install -r requirements.txt
```

## Run (dev)

```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

## Endpoints

- GET `/health` -> `{ "status": "ok" }`
- GET `/hello?name=world` -> `{ "message": "Hello, world!" }`

## Notes

- CORS allows `http://localhost:3000` by default.
- Change host/port as needed.
