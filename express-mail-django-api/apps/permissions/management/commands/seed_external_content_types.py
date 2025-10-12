from django.core.management import BaseCommand
from django.contrib.contenttypes.models import ContentType
from django.db import transaction

from shared.constants import ExternalModels


class Command(BaseCommand):
    """
    Management command to seed ContentType for external models.
    """

    help = "Seed ContentType for external/microservice models"

    @transaction.atomic
    def handle(self, *args, **options):
        """
        Handle the command execution: Seed ContentType.
        """

        for app_label, model in ExternalModels.values():
            content_type, created = ContentType.objects.get_or_create(
                app_label=app_label, model=model
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f"Created ContentType: {app_label}.{model}")
                )

        self.stdout.write(self.style.SUCCESS("Successfully seeded all ContentTypes!"))
