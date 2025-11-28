from drf_spectacular.utils import extend_schema
from rest_framework.decorators import action
from rest_framework.viewsets import ModelViewSet

from apps.post_offices.filters import PostOfficeFilter
from apps.post_offices.models import PostOffice
from apps.post_offices.permissions import PostOfficeObjectPermissions
from apps.post_offices.serializers import PostOfficeSerializer
from apps.users.permissions import (
    ViewShipperProfilePermission,
    ViewPostOfficeStaffProfilePermission,
)
from apps.users.models import User
from apps.users.serializers import (
    UserShipperProfileSerializer,
    UserPostOfficeStaffProfileSerializer,
)
from shared.apis import BaseAPIViewSet
from shared.permissions import FullDjangoModelPermissions


@extend_schema(tags=["PostOffices"])
class PostOfficeViewSet(ModelViewSet, BaseAPIViewSet):
    """
    API endpoint for PostOffice model.
    """

    queryset = PostOffice.objects.all().order_by("id")
    serializer_class = PostOfficeSerializer
    permission_classes = [FullDjangoModelPermissions]
    filterset_class = PostOfficeFilter

    @extend_schema(request=None, responses=UserShipperProfileSerializer)
    @action(
        detail=True,
        methods=["get"],
        url_path="shippers",
        permission_classes=[ViewShipperProfilePermission, PostOfficeObjectPermissions],
    )
    def get_shippers(self, request, pk=None):
        """
        Get all shippers of a post office.
        """

        post_office = self.get_object()
        users = User.objects.filter(shipper_profile__post_office=post_office)
        return self.response_pagination(request, users, UserShipperProfileSerializer)

    @extend_schema(request=None, responses=UserPostOfficeStaffProfileSerializer)
    @action(
        detail=True,
        methods=["get"],
        url_path="post-office-staffs",
        permission_classes=[
            ViewPostOfficeStaffProfilePermission,
            PostOfficeObjectPermissions,
        ],
    )
    def get_post_office_staffs(self, request, pk=None):
        """
        Get all shippers of a post office.
        """

        post_office = self.get_object()
        users = User.objects.filter(post_office_staff_profile__post_office=post_office)
        return self.response_pagination(
            request, users, UserPostOfficeStaffProfileSerializer
        )
