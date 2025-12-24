import base64
from Crypto.Cipher import AES
from Crypto.Protocol.KDF import PBKDF2
from Crypto.Random import get_random_bytes


class Encrypt:
    """
    Encrypt provides static methods for AES encryption and decryption of text with a password.
    """

    @staticmethod
    def encrypt_text(text, password):
        """
        Encrypt the input text using AES-CBC, deriving a key from the provided password.
        The result is Base64-encoded and includes salt and IV for later decryption.
        """

        data = text.encode("utf-8")
        salt = get_random_bytes(16)
        key = PBKDF2(password.encode("utf-8"), salt, dkLen=32)
        cipher = AES.new(key, AES.MODE_CBC)
        pad_len = 16 - len(data) % 16
        padded = data + bytes([pad_len] * pad_len)
        ct_bytes = cipher.encrypt(padded)
        encrypted = salt + cipher.iv + ct_bytes
        return base64.b64encode(encrypted).decode("utf-8")

    @staticmethod
    def decrypt_text(encrypted_text, password):
        """
        Decrypt the Base64-encoded, AES-encrypted input string using the provided password.
        Handles salt, IV extraction, padding removal, and decoding to UTF-8.
        """

        data = base64.b64decode(encrypted_text)
        salt = data[:16]
        iv = data[16:32]
        ct_bytes = data[32:]
        key = PBKDF2(password.encode("utf-8"), salt, dkLen=32)
        cipher = AES.new(key, AES.MODE_CBC, iv)
        padded = cipher.decrypt(ct_bytes)
        pad_len = padded[-1]
        return padded[:-pad_len].decode("utf-8")
