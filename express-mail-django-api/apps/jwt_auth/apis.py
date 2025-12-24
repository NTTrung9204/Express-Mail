from drf_spectacular.utils import extend_schema
from rest_framework.generics import GenericAPIView
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from apps.jwt_auth.serializers import (
    LogoutSerializer,
    CustomTokenObtainPairSerializer,
)
from rest_framework.response import Response
from rest_framework import status

from services.jwt_auth.jwt_auth_services import JWTAuthService
from services.users.user_services import UserService


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom login view.
    """

    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        """
        When user successfully login, add access token to whitelist.
        """

        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        validated_data = serializer.validated_data

        JWTAuthService.add_access_token_to_whitelist(
            validated_data["access"], serializer.user
        )

        validated_data["user"] = UserService.get_base_user_infor(serializer.user)

        return Response(validated_data, status=status.HTTP_200_OK)


class CustomTokenRefreshView(TokenRefreshView):
    """
    Custom refresh token view.
    """

    def post(self, request, *args, **kwargs):
        """
        When user uses refresh token, add new access token to whitelist.
        """

        response = super().post(request, *args, **kwargs)
        user = JWTAuthService.get_user_from_refresh_token(request.data["refresh"])
        JWTAuthService.add_access_token_to_whitelist(response.data["access"], user)
        return response


class LogoutView(GenericAPIView):
    """
    Logout view that invalidates access and/or refresh tokens.
    """

    serializer_class = LogoutSerializer

    @extend_schema(
        request=LogoutSerializer,
        responses={204: None},
        description="Send either access, refresh, or both tokens to invalid token.",
    )
    def post(self, request):
        """
        Handle logout by deleting the access token from the whitelist
        and blacklisting the refresh token if provided.
        """

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        access_token_str = serializer.validated_data.get("access")
        JWTAuthService.logout_user(access_token_str)

        return Response(status=status.HTTP_204_NO_CONTENT)
