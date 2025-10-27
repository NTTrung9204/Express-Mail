from random import randint


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
