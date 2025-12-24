from django.db import models

from shared.models import BaseModel


class PostOffice(BaseModel):
    """
    Model representing a post office.
    """

    name = models.CharField(max_length=100)
    district = models.CharField(max_length=20)
    province_city = models.CharField(max_length=20)
    ward_commune = models.CharField(max_length=20)
    address = models.TextField()
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)

    class Meta:
        """
        Meta class for the PostOffice model.
        """

        db_table = "post_offices"
        permissions = [
            ("add_shipper", "Can add shipper to post office"),
            ("add_staff", "Can add staff to post office"),
            ("edit_user", "Can edit user of a post office"),
            ("delete_user", "Can delete user of a post office"),
            ("view_user", "Can view user of a post office"),
        ]
