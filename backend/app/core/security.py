import json
from cryptography.fernet import Fernet
from app.config import settings

# Initialize cipher suite safely using the vaulted key config
cipher_suite = Fernet(settings.ENCRYPTION_SECRET_KEY.encode() if isinstance(settings.ENCRYPTION_SECRET_KEY, str) else settings.ENCRYPTION_SECRET_KEY)

def encrypt_api_keys(keys_dict: dict) -> str:
    """Encrypts cleartext provider configurations for secure DB storage."""
    serialized = json.dumps(keys_dict)
    encrypted_bytes = cipher_suite.encrypt(serialized.encode())
    return encrypted_bytes.decode()

def decrypt_api_keys(encrypted_str: str) -> dict:
    """Decrypts protected backend settings values into an accessible dictionary."""
    if not encrypted_str or encrypted_str == "{}":
        return {}
    decrypted_bytes = cipher_suite.decrypt(encrypted_str.encode())
    return json.loads(decrypted_bytes.decode())