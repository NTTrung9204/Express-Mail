from drf_spectacular.utils import extend_schema
from rest_framework.permissions import DjangoModelPermissions
from rest_framework.viewsets import ModelViewSet

from apps.post_offices.models import PostOffice
from apps.post_offices.serializers import PostOfficeSerializer
from shared.apis import BaseAPIViewSet


@extend_schema(tags=["Admin > PostOffices"])
class AdminPostOfficeViewSet(ModelViewSet, BaseAPIViewSet):
    """
    API endpoint for PostOffice model, use in admin site.
    """

    queryset = PostOffice.objects.all()
    serializer_class = PostOfficeSerializer
    permission_classes = [DjangoModelPermissions]
