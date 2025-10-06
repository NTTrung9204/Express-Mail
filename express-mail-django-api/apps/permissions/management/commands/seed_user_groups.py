from django.contrib.auth.models import Group
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.users.models import User
from shared.constants import ROLE_GROUP_MAP


class Command(BaseCommand):
    """
    Management command to assign users to groups based on their roles.
    """

    help = "Assign users to groups based on ROLE_GROUP_MAP"

    @transaction.atomic
    def handle(self, *args, **options):
        """
        Handle the command execution: Assign users to groups.
        """

        users = User.objects.all()

        for user in users:
            group_names = ROLE_GROUP_MAP.get(user.role)

            if not group_names:
                continue

            user.groups.clear()

            for group_name in group_names:
                group = Group.objects.get(name=group_name)
                user.groups.add(group)

        self.stdout.write(self.style.SUCCESS("Successfully assigned groups!"))
