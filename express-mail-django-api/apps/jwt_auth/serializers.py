from django.contrib.auth.models import update_last_login
from rest_framework_simplejwt.serializers import (
    TokenBlacklistSerializer,
    TokenObtainPairSerializer,
)
from rest_framework import serializers
from rest_framework_simplejwt.exceptions import TokenError, AuthenticationFailed
from apps.jwt_auth.models import AccessTokenWhiteList
from apps.permissions.constants import Roles
from services.permissions.permission_services import PermissionService
from services.users.user_services import UserService
from shared.messages import ERROR_MESSAGES
from rest_framework_simplejwt.settings import api_settings


class LogoutSerializer(serializers.Serializer):
    """
    Serializer for logout endpoint.
    Accepts either access token, refresh token, or both.
    """

    access = serializers.CharField(required=False)
    refresh = serializers.CharField(required=False)

    def validate_access(self, value):
        """
        Check if access token is valid.
        """

        if not AccessTokenWhiteList.objects.filter(token=value).exists():
            raise serializers.ValidationError(ERROR_MESSAGES["common"]["invalid_token"])

        return value

    def validate_refresh(self, value):
        """
        Check if refresh token is valid.
        """

        serializer = TokenBlacklistSerializer(data={"refresh": value})
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise serializers.ValidationError(str(e))

        return value


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    JWT serializer with extra claims
    """

    @classmethod
    def get_token(cls, user):
        """
        Return token with custom claims.
        """

        token = super().get_token(user)
        token["role"] = user.role
        permissions = user.get_all_permissions()
        token["permissions"] = (
            PermissionService.gzip_permissions(permissions) if permissions else ""
        )
        if user.role == Roles.SHOP.value:
            token["post_office_id"] = (
                user.shop_profile.post_office.id
                if user.shop_profile.post_office
                else None
            )

        return token

    def validate(self, attrs):
        """
        Authenticate user credentials and return JWT access/refresh tokens with custom claims.
        """

        authenticate_kwargs = {
            self.username_field: attrs.get(self.username_field),
            "password": attrs.get("password"),
        }

        request = self.context.get("request")
        if request:
            authenticate_kwargs["request"] = request

        user = UserService.get_user_with_credentials(
            attrs.get(self.username_field), attrs.get("password")
        )

        if user is None:
            raise AuthenticationFailed(
                ERROR_MESSAGES["common"]["invalid_basic_auth"],
            )

        if not user.is_active:
            raise AuthenticationFailed(
                ERROR_MESSAGES["common"]["account_disabled"],
            )

        self.user = user

        refresh = self.get_token(self.user)

        data = {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }

        if api_settings.UPDATE_LAST_LOGIN:
            update_last_login(None, self.user)

        return data
