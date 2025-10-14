from django.contrib.auth.hashers import make_password
from django.core.management import BaseCommand
import os

from apps.permissions.constants import Roles
from apps.users.models import User
from django.db import transaction


class Command(BaseCommand):
    """
    Management command to seed super admin account.
    """

    help = "Seed super admin account"

    @transaction.atomic
    def handle(self, *args, **options):
        """
        Handle the command execution: Seed super admin account.
        """

        username = os.environ.get("SUPER_ADMIN_USERNAME")
        password = os.environ.get("SUPER_ADMIN_PASSWORD")

        User.all_objects.get_or_create(
            username=username,
            defaults={
                "is_superuser": True,
                "email": "super_admin@example.com",
                "password": make_password(password),
                "role": Roles.SUPER_ADMIN.value,
            },
        )

        self.stdout.write(self.style.SUCCESS("Successfully seed super admin account!!"))
