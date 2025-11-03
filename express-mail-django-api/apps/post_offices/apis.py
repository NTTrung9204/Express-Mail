from drf_spectacular.utils import extend_schema
from rest_framework.viewsets import ModelViewSet

from apps.post_offices.filters import PostOfficeFilter
from apps.post_offices.models import PostOffice
from apps.post_offices.serializers import PostOfficeSerializer
from shared.apis import BaseAPIViewSet
from shared.permissions import FullDjangoModelPermissions


@extend_schema(tags=["PostOffices"])
class PostOfficeViewSet(ModelViewSet, BaseAPIViewSet):
    """
    API endpoint for PostOffice model.
    """

    queryset = PostOffice.objects.all()
    serializer_class = PostOfficeSerializer
    permission_classes = [FullDjangoModelPermissions]
    filterset_class = PostOfficeFilter
