from django.db import models
from django.utils.timezone import now


class SoftDeleteManager(models.Manager):
    """
    Custom manager to filter out soft-deleted objects (where deleted_at is not set).
    """

    def get_queryset(self):
        """
        Return queryset excluding soft-deleted objects.
        """

        return super().get_queryset().filter(deleted_at__isnull=True)


class BaseModel(models.Model):
    """
    Abstract base model that adds created_at, updated_at, and soft delete functionality.
    """

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, default=None)
    objects = SoftDeleteManager()
    all_objects = models.Manager()

    def soft_delete(self):
        """
        Soft delete the object by setting deleted_at to current time.
        """

        self.deleted_at = now()
        self.save()

    def restore(self):
        """
        Restore a soft-deleted object by setting deleted_at to None.
        """

        self.deleted_at = None
        self.save()

    class Meta:
        """
        Mark this model as abstract so it won't create a database table.
        """

        abstract = True