from celery import shared_task
from django.template.loader import render_to_string
from django.conf import settings
from utils.send_mail import SendMail


@shared_task
def send_init_password_email_task(email, plain_password):
    """
    Send init password to user's email.
    """

    if not email:
        return

    subject = f"{settings.APP_NAME}: Mật khẩu khởi tạo tài khoản"
    html_message = render_to_string(
        "emails/send_init_password.html",
        {"initial_password": plain_password, "app_name": settings.APP_NAME},
    )
    SendMail.send(subject, html_message, [email])


@shared_task
def send_reset_password_otp_task(email, otp):
    """
    Send reset password OPT to user's email.
    """

    subject = f"{settings.APP_NAME}: Mã xác thực đặt lại mật khẩu"
    html_message = render_to_string(
        "emails/reset_password_otp.html",
        {"otp": otp, "app_name": settings.APP_NAME},
    )
    SendMail.send(subject, html_message, [email])
