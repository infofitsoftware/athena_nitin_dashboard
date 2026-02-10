# Athena Dashboard - Backend

FastAPI backend for the Athena BI Dashboard.

## Setup

1. **Install dependencies:**
   ```bash
   poetry install
   # or
   pip install -r requirements.txt
   ```

2. **Create `.env` file:**
   ```bash
   cp .env.example .env
   # Edit .env with your AWS credentials
   ```

3. **Run the server:**
   ```bash
   poetry run uvicorn app.main:app --reload
   ```

   Or use the convenience script:
   ```bash
   # Windows
   run.bat
   
   # Linux/Mac
   chmod +x run.sh
   ./run.sh
   ```

## Troubleshooting

### Access Denied Error

If you get an "access denied" error:

1. **Try a different port:**
   ```bash
   poetry run uvicorn app.main:app --reload --port 8001
   ```

2. **Check if port is in use:**
   ```bash
   # Windows
   netstat -ano | findstr :8000
   
   # Linux/Mac
   lsof -i :8000
   ```

3. **Run as Administrator** (Windows only):
   - Right-click terminal → "Run as Administrator"
   - Then run the uvicorn command

4. **Check Windows Firewall:**
   - Allow Python/uvicorn through Windows Firewall if needed

### Missing .env File

Ensure `backend/.env` exists with required variables:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `ATHENA_WORKGROUP`
- `ATHENA_DATABASE`
- `ATHENA_TABLE`

## API Documentation

Once running, visit:
- API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/api/v1/health
