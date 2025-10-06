from django.contrib.auth.models import Group, Permission
from django.core.management.base import BaseCommand
from django.db import transaction

from shared.constants import GROUP_PERMISSIONS_MAP


class Command(BaseCommand):
    """
    Management command to assign permissions to groups.
    """

    help = "Assign permissions to groups based on GROUP_PERMISSIONS_MAP"

    @transaction.atomic
    def handle(self, *args, **options):
        """
        Handle the command execution: Assign permissions to groups.
        """

        for group_name, permission_codenames in GROUP_PERMISSIONS_MAP.items():
            group = Group.objects.get(name=group_name)
            group.permissions.clear()

            for codename in permission_codenames:
                permission = Permission.objects.get(codename=codename)
                group.permissions.add(permission)

        self.stdout.write(
            self.style.SUCCESS("Successfully assigned group - permissions!")
        )
