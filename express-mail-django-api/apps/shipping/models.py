from django.core.validators import MinValueValidator

from shared.models import BaseModel
from django.db import models


class ShippingRate(BaseModel):
    """
    Stores configuration for calculating shipping fees.
    """

    base_fee = models.DecimalField(
        max_digits=10, decimal_places=2, validators=[MinValueValidator(0)]
    )
    rate_per_km = models.DecimalField(
        max_digits=10, decimal_places=2, validators=[MinValueValidator(0)]
    )
    volumetric_divisor = models.IntegerField(
        default=5000, validators=[MinValueValidator(1)]
    )
    rate_per_kg = models.DecimalField(
        max_digits=10, decimal_places=2, validators=[MinValueValidator(0)]
    )
    is_active = models.BooleanField(default=False)

    class Meta:
        """
        Meta class for ShippingRate model.
        """

        db_table = "shipping_rate"
        permissions = [
            ("change_shippingrate_status", "Can change shipping rate status"),
        ]

    def save(self, *args, **kwargs):
        """
        Ensure only one record is active
        """

        if self.is_active:
            ShippingRate.objects.filter(is_active=True).exclude(pk=self.pk).update(
                is_active=False
            )
        super().save(*args, **kwargs)

    @classmethod
    def get_current_rate(cls):
        """
        Return the currently active shipping rate.
        """

        return cls.objects.filter(is_active=True).first()

    def activate(self):
        """
        Set this shipping rate as active and deactivate others.
        """

        ShippingRate.objects.filter(is_active=True).exclude(pk=self.pk).update(
            is_active=False
        )
        self.is_active = True
        self.save()
