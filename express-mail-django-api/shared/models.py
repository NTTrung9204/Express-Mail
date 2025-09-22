from django.db import models
from django.conf import settings
from django.utils import timezone
from safedelete import SOFT_DELETE_CASCADE
from safedelete.models import SafeDeleteModel


class BaseModel(SafeDeleteModel):
    """
    Abstract base model with created_at, updated_at, and soft delete cascade functionality.
    """

    _safedelete_policy = SOFT_DELETE_CASCADE

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


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
