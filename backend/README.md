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

## Google Cloud credentials (Dialogflow, etc.)

1. Place your service account key JSON in this folder (e.g. `backend/makanbot-key.json`).
2. Do NOT commit it. The repo `.gitignore` already ignores `backend/*.json`.
3. Set the environment variable before running the backend.

Windows PowerShell (current session only):

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS = "${PWD}\makanbot-key.json"
py -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Cross-platform alternative: create a `.env` file and load it in `main.py` (optional).

## Google Maps Places (GOOGLE_MAPS_API_KEY)

Set your API key before running the backend:

```powershell
$env:GOOGLE_MAPS_API_KEY = "YOUR_KEY_HERE"
$env:DIALOGFLOW_PROJECT_ID = "YOUR_PROJECT_ID"
```

Test chat endpoint:

```powershell
Invoke-WebRequest -UseBasicParsing \
  -Uri http://127.0.0.1:8000/chat \
  -Method POST \
  -ContentType 'application/json' \
  -Body '{"message":"find cheap sushi near orchard"}' \
| Select-Object -ExpandProperty Content
```
