from email.mime.image import MIMEImage

from django.conf import settings
from django.core.mail import EmailMultiAlternatives


class SendMail:
    """
    Service class user for sending information to user's email.
    """

    @staticmethod
    def send(
        subject, html_message, recipient_list, attachments=None, inline_images=None
    ):
        """
        Send email with optional attachments and inline images.
        """

        from_email = f"{settings.NAME_SENDER} <{settings.EMAIL_SENDER}>"

        email = EmailMultiAlternatives(
            subject=subject, body="", from_email=from_email, to=recipient_list
        )
        email.attach_alternative(html_message, "text/html")

        if attachments:
            for filename, content, mimetype in attachments:
                email.attach(filename, content, mimetype)

        if inline_images:
            for cid, img_buffer in inline_images.items():
                img = MIMEImage(img_buffer.getvalue(), _subtype="png")
                img.add_header("Content-ID", f"<{cid}>")
                img.add_header("Content-Disposition", "inline", filename=f"{cid}.png")
                email.attach(img)

        email.send()
