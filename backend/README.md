# Athena Dashboard - Backend

FastAPI backend for the Athena BI Dashboard.

## Setup

1. **Create and activate virtual environment:**
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # Linux/Mac
   source venv/bin/activate
   ```

2. **Install dependencies:**
   ```bash
   # Production dependencies only
   pip install -r requirements.txt
   
   # Or with dev dependencies
   pip install -r requirements-dev.txt
   ```

3. **Create `.env` file:**
   ```bash
   # Copy the example file (if exists) or create manually
   # Edit .env with your AWS credentials
   ```

4. **Run the server:**
   ```bash
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
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
   uvicorn app.main:app --reload --port 8001
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
