from django.db import models


class Routing(models.Model):
    """
    Dummy model for defining custom permissions for the Routing app.
    """

    class Meta:
        """
        Meta class for Routing dummy model.
        """

        managed = False
        default_permissions = ()
        permissions = [
            ("call_vrp", "Can call VRP API"),
        ]
