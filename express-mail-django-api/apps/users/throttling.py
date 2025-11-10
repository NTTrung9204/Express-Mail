from rest_framework.throttling import UserRateThrottle


class OTPRequestThrottle(UserRateThrottle):
    """
    Throttle for requesting OTP.
    """

    scope = "otp_request"


class OTPVerifyThrottle(UserRateThrottle):
    """
    Throttle for verifying OTP.
    """

    scope = "otp_verify"


class OTPConfirmThrottle(UserRateThrottle):
    """
    Throttle for confirming OTP.
    """

    scope = "otp_confirm"
