from cryptography.fernet import Fernet

from advisorapp.settings import FERNET_KEY

fernet = Fernet(FERNET_KEY.encode())

def encrypt_password(password: str) -> str:
    return fernet.encrypt(password.encode()).decode()

def decrypt_password(token: str) -> str:
    return fernet.decrypt(token.encode()).decode()