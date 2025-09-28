from django.core.management import BaseCommand
import os
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

        super_admin, _ = User.all_objects.get_or_create(username=username)

        super_admin.is_superuser = True
        super_admin.email = "super_admin@example.com"
        super_admin.set_password(password)
        super_admin.save()

        self.stdout.write(self.style.SUCCESS("Successfully seed super admin account!!"))
