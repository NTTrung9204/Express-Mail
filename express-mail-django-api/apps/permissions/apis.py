from django.contrib.auth.models import Permission, Group
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ReadOnlyModelViewSet

from apps.permissions.serializers import PermissionSerializer, GroupSerializer
from services.permissions.permission_services import PermissionService
from shared.permissions import FullDjangoModelPermissions


@extend_schema(tags=["Permissions"])
class PermissionViewSet(ReadOnlyModelViewSet):
    """
    API endpoint for Permission model.
    """

    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [FullDjangoModelPermissions]
    pagination_class = None


@extend_schema(tags=["Groups"])
class GroupViewSet(ReadOnlyModelViewSet):
    """
    API endpoint for Group model.
    """

    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [FullDjangoModelPermissions]
    pagination_class = None
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["name"]

    @action(detail=True, methods=["get"], url_path="permissions")
    def permissions(self, request, pk=None):
        """
        Get all permissions of a group.
        """

        group = self.get_object()
        permissions = PermissionService.get_permissions_of_group(group)
        return Response(
            PermissionSerializer(permissions, many=True).data, status=status.HTTP_200_OK
        )
