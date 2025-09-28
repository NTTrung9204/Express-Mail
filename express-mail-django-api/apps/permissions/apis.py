from django.contrib.auth.models import Permission, Group
from drf_spectacular.utils import extend_schema
from rest_framework.permissions import DjangoModelPermissions
from rest_framework.viewsets import ReadOnlyModelViewSet

from apps.permissions.serializers import PermissionSerializer, GroupSerializer


@extend_schema(tags=["Admin > Permissions"])
class AdminPermissionViewSet(ReadOnlyModelViewSet):
    """
    API endpoint for Permission model, use in admin site.
    """

    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [DjangoModelPermissions]
    pagination_class = None


@extend_schema(tags=["Admin > Groups"])
class AdminGroupViewSet(ReadOnlyModelViewSet):
    """
    API endpoint for Group model, use in admin site.
    """

    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [DjangoModelPermissions]
    pagination_class = None
