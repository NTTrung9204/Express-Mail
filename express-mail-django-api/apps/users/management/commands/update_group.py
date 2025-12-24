from django.core.management import BaseCommand
from django.db.models.aggregates import Count

from apps.permissions.constants import Groups
from apps.users.models import User
from django.db import transaction

from services.groups.group_services import GroupService


class Command(BaseCommand):
    @transaction.atomic
    def handle(self, *args, **options):
        """
        Add users to their corresponding group if they have a role
        and are not already in any group.
        """

        for group_name in Groups.values():
            group = GroupService.get_group_by_name(group_name)
            if group:
                users = (
                    User.all_objects.filter(role=group_name)
                    .annotate(group_count=Count("groups"))
                    .filter(group_count=0)
                )
                group.user_set.add(*users)

        self.stdout.write(self.style.SUCCESS("Update users' groups successfully!!"))
