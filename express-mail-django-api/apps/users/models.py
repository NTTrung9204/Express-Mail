from django.contrib.auth.models import AbstractUser, UserManager
from safedelete.managers import SafeDeleteManager
from django.db import models

from apps.permissions.constants import Roles
from apps.post_offices.models import PostOffice

from shared.models import BaseModel
from django.contrib.auth.models import Permission


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

    email = models.EmailField(unique=True)
    role = models.CharField(choices=Roles.choices(), max_length=20, null=True)
    exclude_permissions = models.ManyToManyField(
        Permission, db_table="user_exclude_permissions", related_name="exclude_users"
    )
    objects = SoftDeleteUserManager()
    all_objects = UserManager()

    class Meta:
        """
        Meta class for the User model.
        """

        db_table = "users"


class AdminProfile(BaseModel):
    """
    Profile for users in the admin group.
    """

    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="admin_profile", null=True
    )

    class Meta:
        """
        Meta class for AdminProfile model.
        """

        db_table = "admin_profiles"


class PostOfficeManagerProfile(BaseModel):
    """
    Profile for users in the post_office_manager group.
    """

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="post_office_manager_profile",
        null=True,
    )
    post_office = models.ForeignKey(
        PostOffice,
        on_delete=models.SET_NULL,
        related_name="manager_profiles",
        null=True,
    )

    class Meta:
        """
        Meta class for PostOfficeManagerProfile model.
        """

        db_table = "post_office_manager_profiles"


class PostOfficeStaffProfile(BaseModel):
    """
    Profile for users in the post_office_staff group.
    """

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="post_office_staff_profile",
        null=True,
    )
    post_office = models.ForeignKey(
        PostOffice, on_delete=models.SET_NULL, related_name="staff_profiles", null=True
    )

    class Meta:
        """
        Meta class for PostOfficeStaffProfile model.
        """

        db_table = "post_office_staff_profiles"


class ShopProfile(BaseModel):
    """
    Profile for users in the shop group.
    """

    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="shop_profile", null=True
    )

    class Meta:
        """
        Meta class for ShopProfile model.
        """

        db_table = "shop_profiles"


class ShipperProfile(BaseModel):
    """
    Profile for users in the shipper group.
    """

    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="shipper_profile", null=True
    )
    post_office = models.ForeignKey(
        PostOffice,
        on_delete=models.SET_NULL,
        related_name="shipper_profiles",
        null=True,
    )

    class Meta:
        """
        Meta class for ShipperProfile model.
        """

        db_table = "shipper_profiles"
