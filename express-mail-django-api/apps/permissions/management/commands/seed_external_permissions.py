from django.core.management import BaseCommand
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import Permission
from django.db import transaction


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

        external_models = [
            {"app_label": "external_app", "model": "order"},
            {"app_label": "external_app", "model": "product"},
            {"app_label": "external_app", "model": "shipping"},
        ]

        basic_perms = ["add", "change", "delete", "view"]

        for item in external_models:
            try:
                content_type = ContentType.objects.get(
                    app_label=item["app_label"], model=item["model"]
                )
            except ContentType.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR(
                        f"ContentType not found: {item['app_label']}.{item['model']}"
                    )
                )
                continue

            for perm in basic_perms:
                codename = f"{perm}_{item['model']}"
                name = f"Can {perm} {item['model']}"

                permission, created = Permission.objects.get_or_create(
                    codename=codename,
                    content_type=content_type,
                    defaults={"name": name},
                )

                if created:
                    self.stdout.write(self.style.SUCCESS(f"Created permission: {name}"))
                else:
                    self.stdout.write(
                        self.style.NOTICE(f"Permission already exists: {name}")
                    )

        self.stdout.write(self.style.SUCCESS("Successfully seeded all permissions!"))
