from django.contrib.auth.models import Permission, Group
from drf_spectacular.utils import extend_schema
from rest_framework.viewsets import ReadOnlyModelViewSet, ModelViewSet

from apps.permissions.serializers import PermissionSerializer, GroupSerializer
from shared.permissions import IsAdminAuthenticated


@extend_schema(tags=["Admin > Permissions"])
class AdminPermissionViewSet(ReadOnlyModelViewSet):
    """
    API endpoint for Permission model.
    """

    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [IsAdminAuthenticated]
    pagination_class = None


@extend_schema(tags=["Admin > Groups"])
class AdminGroupViewSet(ModelViewSet):
    """
    API endpoint for Group model.
    """

    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [IsAdminAuthenticated]
    pagination_class = None
