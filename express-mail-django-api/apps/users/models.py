from django.contrib.auth.models import AbstractUser, UserManager
from safedelete.managers import SafeDeleteManager

from shared.models import BaseModel


class SoftDeleteUserManager(UserManager, SafeDeleteManager):
    """
    Custom user manager that filters out soft-deleted users.
    """

    def get_queryset(self):
        """
        Returns a queryset excluding users with a non-null deleted_at field.
        """

        qs = SafeDeleteManager.get_queryset(self)
        return qs.filter(deleted__isnull=True)


class User(AbstractUser, BaseModel):
    """
    Custom user model extending Django's AbstractUser and BaseModel.
    """

    objects = SoftDeleteUserManager()
    all_objects = UserManager()

    class Meta:
        """
        Meta class for the User model.
        """

        db_table = "users"
