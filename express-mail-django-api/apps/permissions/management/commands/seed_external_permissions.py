from django.core.management import BaseCommand
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import Permission
from django.db import transaction

from apps.permissions.constants import ExternalModels, EXTERNAL_MODEL_PERMISSIONS


class Command(BaseCommand):
    """
    Management command to seed permissions for external models.
    """

    help = "Seed permissions (basic and custom) for external ContentTypes"

    @transaction.atomic
    def handle(self, *args, **options):
        """
        Handle the command execution: Seed permissions.
        """

        for choice in ExternalModels:
            app_label, model = choice.value

            try:
                content_type = ContentType.objects.get(app_label=app_label, model=model)
            except ContentType.DoesNotExist:
                continue

            Permission.objects.filter(content_type=content_type).delete()

        for choice in ExternalModels:
            app_label, model = choice.value

            try:
                content_type = ContentType.objects.get(app_label=app_label, model=model)
            except ContentType.DoesNotExist:
                continue

            for codename, name in EXTERNAL_MODEL_PERMISSIONS.get(choice.name, []):
                Permission.objects.create(
                    codename=codename,
                    content_type=content_type,
                    name=name,
                )

        self.stdout.write(
            self.style.SUCCESS("Successfully seeded all external permissions!")
        )
