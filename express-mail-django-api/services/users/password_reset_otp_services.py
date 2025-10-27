from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import hashlib

from utils.send_mail import SendMail
from django.template.loader import render_to_string

from apps.users.models import PasswordResetOTP

from apps.users.constants import PASSWORD_RESET_OTP_LIFETIME_MINUTES


class PasswordResetOTPService:
    """
    Service class for PasswordResetOTP model.
    """

    @staticmethod
    def send_reset_password_otp(email, otp):
        """
        Send reset password otp to user's email.
        """

        subject = f"{settings.APP_NAME}: Mã xác thực đặt lại mật khẩu"
        html_message = render_to_string(
            "emails/reset_password_otp.html",
            {"otp": otp, "app_name": settings.APP_NAME},
        )

        try:
            SendMail.send(
                subject=subject,
                html_message=html_message,
                recipient_list=[email],
            )
        except Exception:
            pass

    @staticmethod
    def create_password_reset_otp(user, otp):
        """
        Create PasswordResetOTP instance.
        """

        otp_hash = hashlib.sha256(otp.encode()).hexdigest()
        expires_at = timezone.now() + timedelta(
            minutes=PASSWORD_RESET_OTP_LIFETIME_MINUTES
        )

        return PasswordResetOTP.objects.create(
            user=user, otp_hash=otp_hash, expires_at=expires_at
        )

    @staticmethod
    def get_latest_available_password_reset_otp(user):
        """
        Get latest available password reset otp of a user.
        """

        now = timezone.now()
        latest_password_reset_otp = (
            PasswordResetOTP.objects.filter(
                user=user, is_used=False, expires_at__gte=now
            )
            .order_by("-expires_at")
            .first()
        )

        return latest_password_reset_otp
