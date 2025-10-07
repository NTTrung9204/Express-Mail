from django.contrib.auth.models import Permission, Group
from drf_spectacular.utils import extend_schema
from rest_framework.permissions import DjangoModelPermissions
from rest_framework.viewsets import ReadOnlyModelViewSet

from apps.permissions.serializers import PermissionSerializer, GroupSerializer


@extend_schema(tags=["Permissions"])
class PermissionViewSet(ReadOnlyModelViewSet):
    """
    API endpoint for Permission model.
    """

    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [DjangoModelPermissions]
    pagination_class = None


@extend_schema(tags=["Groups"])
class GroupViewSet(ReadOnlyModelViewSet):
    """
    API endpoint for Group model.
    """

    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [DjangoModelPermissions]
    pagination_class = None
