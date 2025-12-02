from django.db import models

from shared.models import BaseModel


class PostOffice(BaseModel):
    """
    Model representing a post office.
    """

    name = models.CharField(max_length=100)
    district = models.PositiveIntegerField()
    province_city = models.PositiveIntegerField()
    ward_commune = models.PositiveIntegerField()
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
        ]
