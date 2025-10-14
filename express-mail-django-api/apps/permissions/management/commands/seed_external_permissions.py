from django.core.management import BaseCommand
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import Permission
from django.db import transaction

from apps.permissions.constants import ExternalModels


class Command(BaseCommand):
    """
    Management command to seed basic permissions for external models.
    """

    help = "Seed add/change/delete/view permissions for external ContentTypes"

    @transaction.atomic
    def handle(self, *args, **options):
        """
        Handle the command execution: Seed permissions.
        """

        basic_perms = ["add", "change", "delete", "view"]

        for app_label, model in ExternalModels.values():
            try:
                content_type = ContentType.objects.get(app_label=app_label, model=model)
            except ContentType.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR(f"ContentType not found: {app_label}.{model}")
                )
                continue

            for perm in basic_perms:
                codename = f"{perm}_{model}"
                name = f"Can {perm} {model}"

                permission, created = Permission.objects.get_or_create(
                    codename=codename,
                    content_type=content_type,
                    defaults={"name": name},
                )

                if created:
                    self.stdout.write(self.style.SUCCESS(f"Created permission: {name}"))

        self.stdout.write(self.style.SUCCESS("Successfully seeded all permissions!"))
