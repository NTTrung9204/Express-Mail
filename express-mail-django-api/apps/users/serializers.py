from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from apps.permissions.constants import Groups
from apps.users.models import (
    User,
    AdminProfile,
    ShopProfile,
    PostOfficeManagerProfile,
    ShipperProfile,
    PostOfficeStaffProfile,
)
from services.groups.group_services import GroupService
from shared.messages import ERROR_MESSAGES


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the User model.
    """

    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(
        validators=[
            UniqueValidator(
                queryset=User.all_objects.all(),
                message=ERROR_MESSAGES["email_already_exists"],
            )
        ]
    )

    class Meta:
        """
        Meta class for UserSerializer.
        """

        model = User
        fields = [
            "id",
            "username",
            "password",
            "email",
            "first_name",
            "last_name",
            "role",
            "exclude_permissions",
        ]
        read_only_fields = ["role", "exclude_permissions"]


class BaseProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for the BaseProfile model.
    """

    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.exclude(is_superuser=True),
        required=True,
        allow_null=False,
    )

    class Meta:
        """
        Meta class for BaseProfileSerializer.
        """

        abstract = True


class AdminProfileSerializer(BaseProfileSerializer):
    """
    Serializer for AdminProfile model.
    """

    exclude_permissions = serializers.PrimaryKeyRelatedField(
        queryset=GroupService.get_permissions_of_group(Groups.ADMIN.value),
        many=True,
        allow_empty=True,
        write_only=True,
    )

    class Meta:
        """
        Meta class for AdminProfileSerializer.
        """

        model = AdminProfile
        fields = ["id", "user", "exclude_permissions"]


class PostOfficeManagerProfileSerializer(BaseProfileSerializer):
    """
    Serializer for PostOfficeManagerProfile model.
    """

    exclude_permissions = serializers.PrimaryKeyRelatedField(
        queryset=GroupService.get_permissions_of_group(
            Groups.POST_OFFICE_MANAGER.value
        ),
        many=True,
        allow_empty=True,
        write_only=True,
    )

    class Meta:
        """
        Meta class for PostOfficeManagerProfileSerializer.
        """

        model = PostOfficeManagerProfile
        fields = ["id", "user", "post_office", "exclude_permissions"]


class PostOfficeStaffProfileSerializer(BaseProfileSerializer):
    """
    Serializer for PostOfficeStaffProfile model.
    """

    exclude_permissions = serializers.PrimaryKeyRelatedField(
        queryset=GroupService.get_permissions_of_group(Groups.POST_OFFICE_STAFF.value),
        many=True,
        allow_empty=True,
        write_only=True,
    )

    class Meta:
        """
        Meta class for PostOfficeStaffProfileSerializer.
        """

        model = PostOfficeStaffProfile
        fields = ["id", "user", "post_office", "exclude_permissions"]


class ShopProfileSerializer(BaseProfileSerializer):
    """
    Serializer for ShopProfile model.
    """

    exclude_permissions = serializers.PrimaryKeyRelatedField(
        queryset=GroupService.get_permissions_of_group(Groups.SHOP.value),
        many=True,
        allow_empty=True,
        write_only=True,
    )

    class Meta:
        """
        Meta class for ShopProfileSerializer.
        """

        model = ShopProfile
        fields = ["id", "user", "exclude_permissions"]


class ShipperProfileSerializer(BaseProfileSerializer):
    """
    Serializer for ShipperProfile model.
    """

    exclude_permissions = serializers.PrimaryKeyRelatedField(
        queryset=GroupService.get_permissions_of_group(Groups.SHIPPER.value),
        many=True,
        allow_empty=True,
        write_only=True,
    )

    class Meta:
        """
        Meta class for ShipperProfileSerializer.
        """

        model = ShipperProfile
        fields = ["id", "user", "post_office", "exclude_permissions"]
