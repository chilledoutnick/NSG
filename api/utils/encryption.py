import logging
from cryptography.fernet import Fernet

from advisorapp.settings import FERNET_KEY

logger = logging.getLogger(__name__)

try:
    fernet = Fernet(FERNET_KEY.encode()) if FERNET_KEY else None
except Exception as e:
    logger.warning(f"Failed to initialize Fernet with FERNET_KEY: {e}")
    fernet = None

def encrypt_password(password: str) -> str:
    if not fernet:
        return password
    return fernet.encrypt(password.encode()).decode()

def decrypt_password(token: str) -> str:
    if not fernet:
        return token
    try:
        return fernet.decrypt(token.encode()).decode()
    except Exception:
        return token