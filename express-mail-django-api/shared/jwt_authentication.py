from drf_spectacular.extensions import OpenApiAuthenticationExtension
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken

from apps.jwt_auth.models import AccessTokenWhiteList


class WhitelistJWTAuthenticationExtension(OpenApiAuthenticationExtension):
    """
    OpenAPI extension for WhitelistJWTAuthentication to be recognized by drf-spectacular.
    """

    target_class = "shared.jwt_authentication.WhitelistJWTAuthentication"
    name = "JWT"

    def get_security_definition(self, auto_schema):
        """
        Return OpenAPI security definition for Bearer JWT token.
        """

        return {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }


class WhitelistJWTAuthentication(JWTAuthentication):
    """
    JWT authentication that checks access tokens against a whitelist.
    """

    def authenticate(self, request):
        """
        Authenticate request and ensure the access token is in the whitelist.
        """

        result = super().authenticate(request)
        if result is None:
            return None

        user, token = result
        token_str = str(token)

        if not AccessTokenWhiteList.objects.filter(token=token_str, user=user).exists():
            raise InvalidToken

        return user, token
