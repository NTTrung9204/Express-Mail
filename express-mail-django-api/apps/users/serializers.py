from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from apps.users.models import (
    User,
    AdminProfile,
    ShopProfile,
    PostOfficeManagerProfile,
    ShipperProfile,
    PostOfficeStaffProfile,
)
from shared.constants import Roles
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

    def to_representation(self, instance):
        """
        Add user profile to serializer data.
        """

        data = super().to_representation(instance)

        if instance.role and instance.role != Roles.SUPER_ADMIN.value:
            role_profile_map = {
                Roles.ADMIN.value: ("admin_profile", AdminProfileSerializer),
                Roles.POST_OFFICE_MANAGER.value: (
                    "post_office_manager_profile",
                    PostOfficeManagerProfileSerializer,
                ),
                Roles.POST_OFFICE_STAFF.value: (
                    "post_office_staff_profile",
                    PostOfficeStaffProfileSerializer,
                ),
                Roles.SHOP.value: ("shop_profile", ShopProfileSerializer),
                Roles.SHIPPER.value: ("shipper_profile", ShipperProfileSerializer),
            }

            profile_config = role_profile_map.get(instance.role)
            related_name, serializer_class = profile_config
            profile_instance = getattr(instance, related_name)
            data["profile"] = serializer_class(profile_instance).data

        return data

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
        ]
        read_only_fields = ["role"]


class AdminProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for AdminProfile model.
    """

    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.exclude(is_superuser=True),
        required=True,
        allow_null=False,
    )

    class Meta:
        """
        Meta class for AdminProfileSerializer.
        """

        model = AdminProfile
        fields = ["id", "user"]


class PostOfficeManagerProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for PostOfficeManagerProfile model.
    """

    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.exclude(is_superuser=True),
        required=True,
        allow_null=False,
    )

    class Meta:
        """
        Meta class for PostOfficeManagerProfileSerializer.
        """

        model = PostOfficeManagerProfile
        fields = ["id", "user", "post_office"]


class PostOfficeStaffProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for PostOfficeStaffProfile model.
    """

    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.exclude(is_superuser=True),
        required=True,
        allow_null=False,
    )

    class Meta:
        """
        Meta class for PostOfficeStaffProfileSerializer.
        """

        model = PostOfficeStaffProfile
        fields = ["id", "user", "post_office"]


class ShopProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for ShopProfile model.
    """

    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.exclude(is_superuser=True),
        required=True,
        allow_null=False,
    )

    class Meta:
        """
        Meta class for ShopProfileSerializer.
        """

        model = ShopProfile
        fields = ["id", "user"]


class ShipperProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for ShipperProfile model.
    """

    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.exclude(is_superuser=True),
        required=True,
        allow_null=False,
    )

    class Meta:
        """
        Meta class for ShipperProfileSerializer.
        """

        model = ShipperProfile
        fields = ["id", "user", "post_office"]
