from pathlib import Path
from dotenv import load_dotenv
import os

BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(BASE_DIR / ".env")

APP_NAME = "AuditH"

APP_VERSION = "2.0"

GOOGLE_CREDENTIALS = os.getenv(
    "GOOGLE_CREDENTIALS",
    "credentials.json"
)

TEMP_FOLDER = BASE_DIR / "temp"

TEMP_FOLDER.mkdir(exist_ok=True)

MAX_UPLOAD_SIZE = 100 * 1024 * 1024