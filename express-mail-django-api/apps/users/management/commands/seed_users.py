from django.core.management import BaseCommand
import os
from apps.users.models import User


class Command(BaseCommand):
    """
    Management command to seed super admin account.
    """

    help = "Seed data for super admin account"

    def handle(self, *args, **options):
        """
        Handle the command execution: Seed super admin account.
        """

        username = os.environ.get("ADMIN_USERNAME")
        password = os.environ.get("ADMIN_PASSWORD")

        super_admin, _ = User.all_objects.get_or_create(username=username)

        super_admin.is_superuser = True
        super_admin.set_password(password)
        super_admin.save()

        self.stdout.write(
            self.style.SUCCESS("Successfully seed super admin account!!")
        )
