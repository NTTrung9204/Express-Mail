from django.db import models

from shared.models import BaseModel


class PostOffice(BaseModel):
    """
    Model representing a post office.
    """

    name = models.CharField(max_length=100)
    province_city = models.CharField(max_length=100)
    ward_commune = models.CharField(max_length=100)
    address = models.TextField()
    latitude = models.FloatField()
    longitude = models.FloatField()

    class Meta:
        """
        Meta class for the PostOffice model.
        """

        db_table = "post_offices"
