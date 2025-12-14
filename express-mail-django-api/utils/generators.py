from random import randint
import string
import secrets


class Generator:
    """
    Generator class for generate otp, future date, ...
    """

    @staticmethod
    def generate_otp():
        """
        Generate random 6 digit otp.
        """

        return f"{randint(100000, 999999)}"

    @staticmethod
    def generate_random_password(length=10):
        alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
        return "".join(secrets.choice(alphabet) for _ in range(length))
