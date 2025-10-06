from rest_framework_simplejwt.serializers import (
    TokenObtainPairSerializer,
    TokenBlacklistSerializer,
)
from rest_framework import serializers
from rest_framework_simplejwt.exceptions import TokenError
from apps.jwt_auth.models import AccessTokenWhiteList
from shared.messages import ERROR_MESSAGES


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom serializer extending TokenObtainPairSerializer.
    """

    def to_representation(self, instance):
        """
        Add user information in response data.
        """

        data = super().to_representation(instance)

        user = self.user
        data["user"] = {
            "id": user.id,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
        }

        return data


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
