from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from datetime import datetime, timezone as dt_timezone

from apps.jwt_auth.models import AccessTokenWhiteList


class JWTAuthService:
    """
    Service class for custom JWT authentication.
    """

    @staticmethod
    def add_access_token_to_whitelist(access_token_str, user):
        """
        Add access token to whitelist.
        """

        access_token_obj = AccessToken(access_token_str)
        exp_timestamp = access_token_obj.payload["exp"]
        expires_at = datetime.fromtimestamp(exp_timestamp, dt_timezone.utc)
        AccessTokenWhiteList.objects.create(
            token=access_token_str, user=user, expires_at=expires_at
        )

    @staticmethod
    def get_user_from_refresh_token(refresh_token_str):
        """
        Get User instance from refresh token.
        """

        refresh_token_obj = RefreshToken(refresh_token_str)
        user_id = refresh_token_obj["user_id"]
        return get_user_model().objects.get(id=user_id)

    @staticmethod
    def logout_user(access_token_str):
        """
        Logout user by remove access token from whitelist.
        """

        access_tk_wl = AccessTokenWhiteList.objects.get(token=access_token_str)
        access_tk_wl.delete()
