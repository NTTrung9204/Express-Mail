from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.serializers import TokenBlacklistSerializer
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from shared.jwt.serializers import (
    CustomTokenObtainPairSerializer,
    LogoutSerializer,
    CustomTokenRefreshSerializer,
)
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from shared.models import AccessTokenWhiteList


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom login view.
    """

    serializer_class = CustomTokenObtainPairSerializer


class CustomTokenRefreshView(TokenRefreshView):
    """
    Custom view for refreshing JWT access tokens.
    Uses CustomTokenRefreshSerializer to whitelist new access tokens.
    """

    serializer_class = CustomTokenRefreshSerializer


class LogoutView(APIView):
    """
    Logout endpoint that invalidates access and/or refresh tokens.
    """

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

        access_token = request.data.get("access")
        refresh_token = request.data.get("refresh")

        if access_token:
            access_tk_wl = get_object_or_404(
                AccessTokenWhiteList, token=access_token
            )
            access_tk_wl.delete()
        if refresh_token:
            serializer = TokenBlacklistSerializer(
                data={"refresh": refresh_token}
            )
            try:
                serializer.is_valid(raise_exception=True)
            except TokenError as e:
                return Response(
                    {"refresh_token": str(e)},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        return Response(status=status.HTTP_204_NO_CONTENT)
