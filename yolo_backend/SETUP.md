# YOLO Backend Setup Guide

## Prerequisites

- **Python 3.12** (Required)
  - Download from: https://www.python.org/downloads/
  - Make sure to check "Add Python to PATH" during installation

## Quick Start

### First Time Setup

1. Navigate to the yolo_backend directory:
   ```bash
   cd yolo_backend
   ```

2. Run the development script:
   ```bash
   dev.bat
   ```

That's it! The script will automatically:
- ✅ Create a virtual environment (if it doesn't exist)
- ✅ Install all dependencies
- ✅ Start the YOLO server

### Daily Usage

Every time you want to work on the project:

```bash
cd yolo_backend
dev.bat
```

The script is smart - it only creates the venv once, then reuses it.

## What Gets Committed to Git?

✅ **Committed:**
- `requirements.txt` - Python dependencies
- `dev.bat` - Development script
- `yolo_server.py` - Server code
- All other Python files

❌ **NOT Committed (Local Only):**
- `venv/` - Virtual environment folder
- `__pycache__/` - Python cache
- `*.pyc` - Compiled Python files

## Troubleshooting

### "Python not found"
- Install Python 3.12 from python.org
- Make sure it's added to your PATH

### "Module not found" errors
- Delete the `venv` folder
- Run `dev.bat` again to recreate it

### Dependencies fail to install
- Check your internet connection
- Try updating pip: `python -m pip install --upgrade pip`
- Run `dev.bat` again

## Manual Commands (Advanced)

If you prefer to run commands manually:

```bash
# Create virtual environment
python -m venv venv

# Activate it
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run server
python yolo_server.py
```
