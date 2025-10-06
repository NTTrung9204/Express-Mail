from django.apps import AppConfig


class JwtAuthConfig(AppConfig):
    """
    AppConfig for jwt_auth.
    """

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.jwt_auth"
