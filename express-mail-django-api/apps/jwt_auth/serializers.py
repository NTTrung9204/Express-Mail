from rest_framework_simplejwt.serializers import (
    TokenBlacklistSerializer,
    TokenObtainPairSerializer,
)
from rest_framework import serializers
from rest_framework_simplejwt.exceptions import TokenError
from apps.jwt_auth.models import AccessTokenWhiteList
from apps.permissions.constants import Roles
from shared.messages import ERROR_MESSAGES


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
        if user.role == Roles.SHOP.value:
            token["post_office_id"] = (
                user.shop_profile.post_office.id
                if user.shop_profile.post_office
                else None
            )

        return token
