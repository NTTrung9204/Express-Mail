from shared.models import BaseModel
from django.db import models
from django.conf import settings
from django.utils import timezone


class AccessTokenWhiteList(BaseModel):
    """
    Model to store whitelisted access tokens for users.
    """

    token = models.CharField(max_length=512, unique=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="access_tokens",
    )
    expires_at = models.DateTimeField()

    def is_valid(self):
        """
        Check if the token has not expired.
        """

        return timezone.now() < self.expires_at

    class Meta:
        """
        Meta class for the AccessTokenWhiteList model.
        """

        db_table = "access_token_whitelist"
