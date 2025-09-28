from django.core.management.base import BaseCommand
from apps.users.models import User
from faker import Faker
from django.db import transaction


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

            user, created = User.all_objects.get_or_create(username=username)
            if created:
                user.email = email
                user.first_name = first_name
                user.last_name = last_name
                user.set_password(password)
                user.save()

        self.stdout.write(
            self.style.SUCCESS(f"Successfully seeded {num_users} normal users!!")
        )
