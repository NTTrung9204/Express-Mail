from django.core.management import BaseCommand
import os
from apps.users.models import User


class Command(BaseCommand):
    """
    Management command to seed admin account.
    """

    help = "Seed data for admin account"

    def handle(self, *args, **options):
        """
        Handle the command execution: Seed admin account.
        """

        username = os.environ.get("ADMIN_USERNAME")
        password = os.environ.get("ADMIN_PASSWORD")

        admin, _ = User.all_objects.get_or_create(username=username)

        admin.is_superuser = True
        admin.set_password(password)
        admin.save()

        self.stdout.write(self.style.SUCCESS("Successfully seed admin account!!"))
