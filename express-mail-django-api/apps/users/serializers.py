from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from apps.permissions.constants import Groups
from apps.users.mixins import ShopLocationValidationMixin
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
    username = serializers.CharField(
        validators=[
            UniqueValidator(
                queryset=User.all_objects.all(),
                message=ERROR_MESSAGES["username_already_exists"],
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
            "is_active",
            "exclude_permissions",
        ]
        read_only_fields = ["role", "exclude_permissions", "is_active"]


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


class ShopProfileSerializer(ShopLocationValidationMixin, BaseProfileSerializer):
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
        fields = [
            "id",
            "user",
            "exclude_permissions",
            "address",
            "phone_number",
            "latitude",
            "longitude",
            "post_office",
        ]
        read_only_fields = ["post_office"]

    def validate(self, attrs):
        """
        Check if there is post office nearby shop.
        """

        return self.validate_location(attrs, getattr(self, "instance", None))


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
        fields = [
            "id",
            "user",
            "post_office",
            "exclude_permissions",
            "phone_number",
            "address",
            "motor_model",
            "license_plate_number",
            "avatar",
            "card_id",
        ]


class ResetPasswordRequestSerializer(serializers.Serializer):
    """
    Serializer for reset password request.
    """

    email = serializers.EmailField()


class VerifyResetPasswordOTPSerializer(serializers.Serializer):
    """
    Serializer reset password OTP verification.
    """

    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)


class ResetPasswordConfirmSerializer(serializers.Serializer):
    """
    Serializer reset password confirmation.
    """

    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)
    new_password = serializers.CharField(min_length=6)


class GetNameListRequestSerializer(serializers.Serializer):
    """
    Serializer for get name list by list of user ids request.
    """

    users = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.exclude(is_superuser=True), many=True
    )


class GetNameListResponseSerializer(serializers.ModelSerializer):
    """
    Serializer for get name list by list of user ids response.
    """

    class Meta:
        """
        Meta class for GetNameListResponseSerializer.
        """

        model = User
        fields = ["id", "first_name", "last_name"]
        read_only_fields = ["id", "first_name", "last_name"]


class UserRegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    """

    username = serializers.CharField(
        validators=[
            UniqueValidator(
                queryset=User.all_objects.all(),
                message=ERROR_MESSAGES["username_already_exists"],
            )
        ]
    )
    email = serializers.EmailField(
        validators=[
            UniqueValidator(
                queryset=User.all_objects.all(),
                message=ERROR_MESSAGES["email_already_exists"],
            )
        ]
    )
    password = serializers.CharField(write_only=True)

    class Meta:
        """
        Meta class for UserRegisterSerializer.
        """

        model = User
        fields = ["id", "username", "password", "email", "first_name", "last_name"]


class ShopProfileRegisterSerializer(
    ShopLocationValidationMixin, serializers.ModelSerializer
):
    """
    Serializer for shop profile registration.
    """

    class Meta:
        """
        Meta class for ShopProfileRegisterSerializer.
        """

        model = ShopProfile
        fields = [
            "id",
            "address",
            "phone_number",
            "latitude",
            "longitude",
            "post_office",
        ]
        read_only_fields = ["id", "post_office"]

    def validate(self, attrs):
        """
        Check if there is post office nearby shop.
        """

        return self.validate_location(attrs)


class ShopRegisterSerializer(serializers.Serializer):
    """
    Serializer for shop registration.
    """

    user = UserRegisterSerializer()
    profile = ShopProfileRegisterSerializer()


class UserShipperProfileSerializer(serializers.ModelSerializer):
    """
    User with shipper profile serializer.
    """

    profile = ShipperProfileSerializer(read_only=True, source="shipper_profile")

    class Meta:
        model = User
        fields = [
            "id",
            "first_name",
            "last_name",
            "username",
            "email",
            "profile",
            "is_active",
        ]
        read_only_fields = ["id", "is_active"]


class UserPostOfficeStaffProfileSerializer(serializers.ModelSerializer):
    """
    User with post office staff profile serializer.
    """

    profile = PostOfficeStaffProfileSerializer(
        read_only=True, source="post_office_staff_profile"
    )

    class Meta:
        model = User
        fields = [
            "id",
            "first_name",
            "last_name",
            "username",
            "email",
            "profile",
            "is_active",
        ]
        read_only_fields = ["id", "is_active"]


class ChangeUserStatusRequestSerializer(serializers.Serializer):
    """
    Serializer for change user status request.
    """

    is_active = serializers.BooleanField()
