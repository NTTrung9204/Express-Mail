from django.apps import AppConfig


class UsersConfig(AppConfig):
    """
    AppConfig for users.
    """

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.users"

    def ready(self):
        """
        Import signal classes.
        """
