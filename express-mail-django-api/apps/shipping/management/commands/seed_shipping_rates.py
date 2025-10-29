from django.core.management.base import BaseCommand
from django.db import transaction

from apps.shipping.models import ShippingRate


class Command(BaseCommand):
    """
    Management command to seed shipping rate data.
    """

    help = "Seed shipping rate data"

    @transaction.atomic
    def handle(self, *args, **options):
        """
        Handle the command execution: Seed shipping rate data.
        """

        ShippingRate.objects.create(
            base_fee=10000.00,
            rate_per_km=2500.00,
            volumetric_divisor=6000,
            rate_per_kg=5000.00,
            is_active=True,
        )

        self.stdout.write(self.style.SUCCESS("Seeded shipping rate data successfully."))
