from rest_framework_simplejwt.serializers import (
    TokenObtainPairSerializer,
    TokenRefreshSerializer,
)
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from datetime import datetime, timezone as dt_timezone
from shared.models import AccessTokenWhiteList
from django.contrib.auth import get_user_model
from rest_framework import serializers


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom serializer extending TokenObtainPairSerializer.
    """

    def validate(self, attrs):
        """
        Add custom user information and whitelist access token.
        """

        data = super().validate(attrs)

        data["user"] = {
            "id": self.user.id,
            "username": self.user.username,
            "first_name": self.user.first_name,
            "last_name": self.user.last_name,
        }

        # Whitelist access token
        access_token_str = data["access"]
        access_token_obj = AccessToken(access_token_str)
        exp_timestamp = access_token_obj.payload["exp"]
        expires_at = datetime.fromtimestamp(exp_timestamp, dt_timezone.utc)
        AccessTokenWhiteList.objects.create(
            token=access_token_str, user=self.user, expires_at=expires_at
        )

        return data


class CustomTokenRefreshSerializer(TokenRefreshSerializer):
    """
    Serializer for refreshing JWT access tokens.
    Automatically whitelists the new access token for the corresponding user.
    """

    def validate(self, attrs):
        data = super().validate(attrs)

        # Whitelist access token
        access_token_str = data["access"]
        access_token_obj = AccessToken(access_token_str)
        exp_timestamp = access_token_obj.payload["exp"]
        expires_at = datetime.fromtimestamp(exp_timestamp, dt_timezone.utc)

        refresh_token_obj = RefreshToken(attrs["refresh"])
        user_id = refresh_token_obj["user_id"]
        user = get_user_model().objects.get(id=user_id)

        AccessTokenWhiteList.objects.create(
            token=access_token_str, user=user, expires_at=expires_at
        )

        return data


class LogoutSerializer(serializers.Serializer):
    """
    Serializer for logout endpoint.
    Accepts either access token, refresh token, or both.
    """

    access = serializers.CharField(required=False)
    refresh = serializers.CharField(required=False)
