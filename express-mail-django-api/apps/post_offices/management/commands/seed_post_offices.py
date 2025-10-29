from django.core.management import BaseCommand
from django.db import transaction
from faker import Faker

from apps.post_offices.models import PostOffice


class Command(BaseCommand):
    """
    Management command to seed 20 post offices using Faker.
    """

    help = "Seed 20 post office records"

    @transaction.atomic
    def handle(self, *args, **options):
        """
        Create 20 post offices if they do not exist.
        """

        fake = Faker("vi_VN")
        created_count = 0

        for i in range(1, 21):
            name = f"Bưu cục {i} - {fake.city()}"
            district = fake.random_int(min=1, max=10)
            province_city = fake.random_int(min=1, max=63)
            ward_commune = fake.random_int(min=1, max=15)
            address = fake.street_address()
            latitude = round(float(fake.latitude()), 6)
            longitude = round(float(fake.longitude()), 6)

            defaults = {
                "district": district,
                "province_city": province_city,
                "ward_commune": ward_commune,
                "address": address,
                "latitude": latitude,
                "longitude": longitude,
            }

            _, created = PostOffice.objects.get_or_create(name=name, defaults=defaults)
            if created:
                created_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Seeded post offices. Created: {created_count}, Skipped: {20 - created_count}"
            )
        )
