from django.contrib.auth.hashers import make_password
from django.core.management.base import BaseCommand

from apps.permissions.constants import Roles
from apps.users.models import User
from faker import Faker
from django.db import transaction

from apps.users.models import (
    AdminProfile,
    PostOfficeManagerProfile,
    PostOfficeStaffProfile,
    ShopProfile,
    ShipperProfile,
)
from apps.post_offices.models import PostOffice


class Command(BaseCommand):
    """
    Management command to seed normal user data.
    """

    help = "Seed 50 normal users for User Model"

    @transaction.atomic
    def handle(self, *args, **options):
        """
        Handle the command execution: Seed normal users.
        """

        fake = Faker()
        num_users = 50

        for i in range(num_users):
            username = f"user{i + 1}"
            email = f"user{i + 1}@example.com"
            first_name = fake.first_name()
            last_name = fake.last_name()
            password = "123456"

            user, created = User.all_objects.get_or_create(
                username=username,
                defaults={
                    "email": email,
                    "first_name": first_name,
                    "last_name": last_name,
                    "role": Roles.random(not_values=[Roles.SUPER_ADMIN.value]),
                    "password": make_password(password),
                },
            )

            if created:
                role = user.role

                if role == Roles.ADMIN.value:
                    AdminProfile.objects.get_or_create(user=user)

                elif role == Roles.POST_OFFICE_MANAGER.value:
                    po = PostOffice.objects.order_by("?").first()
                    PostOfficeManagerProfile.objects.get_or_create(
                        user=user,
                        defaults={
                            "post_office": po,
                        },
                    )

                elif role == Roles.POST_OFFICE_STAFF.value:
                    po = PostOffice.objects.order_by("?").first()
                    PostOfficeStaffProfile.objects.get_or_create(
                        user=user,
                        defaults={
                            "post_office": po,
                        },
                    )

                elif role == Roles.SHIPPER.value:
                    po = PostOffice.objects.order_by("?").first()
                    phone_number = f"0{fake.random_int(min=100000000, max=999999999)}"
                    address = fake.address()
                    motor_model = (
                        fake.word().capitalize() + " " + fake.lexify(text="???").upper()
                    )
                    license_plate_number = f"{fake.random_int(min=10, max=99)}A-{fake.random_int(min=10000, max=99999)}"
                    card_id = str(fake.random_int(min=100000000000, max=999999999999))

                    ShipperProfile.objects.get_or_create(
                        user=user,
                        defaults={
                            "post_office": po,
                            "phone_number": phone_number,
                            "address": address,
                            "motor_model": motor_model,
                            "license_plate_number": license_plate_number,
                            "card_id": card_id,
                        },
                    )

                elif role == Roles.SHOP.value:
                    phone_number = f"0{fake.random_int(min=100000000, max=999999999)}"
                    address = fake.address()
                    ShopProfile.objects.get_or_create(
                        user=user,
                        defaults={
                            "phone_number": phone_number,
                            "address": address,
                        },
                    )

        self.stdout.write(
            self.style.SUCCESS(f"Successfully seeded {num_users} normal users!!")
        )
