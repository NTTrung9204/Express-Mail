from django.core.management import BaseCommand
from django.contrib.contenttypes.models import ContentType
from django.db import transaction


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

        external_models = [
            {"app_label": "external_app", "model": "order"},
            {"app_label": "external_app", "model": "product"},
            {"app_label": "external_app", "model": "shipping"},
        ]

        for item in external_models:
            content_type, created = ContentType.objects.get_or_create(
                app_label=item["app_label"], model=item["model"]
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Created ContentType: {item['app_label']}.{item['model']}"
                    )
                )
            else:
                self.stdout.write(
                    self.style.NOTICE(
                        f"ContentType already exists: {item['app_label']}.{item['model']}"
                    )
                )

        self.stdout.write(self.style.SUCCESS("Successfully seeded all ContentTypes!"))
