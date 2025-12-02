from django.db import transaction
from drf_spectacular.utils import extend_schema
from rest_framework.decorators import action
from rest_framework.viewsets import ModelViewSet
from rest_framework import status

from apps.post_offices.filters import PostOfficeFilter
from apps.post_offices.models import PostOffice
from apps.post_offices.permissions import (
    PostOfficeObjectPermissions,
    AddShipperToPostOfficePermissions,
    AddStaffToPostOfficePermissions,
)
from apps.post_offices.serializers import (
    PostOfficeSerializer,
    AddShipperToPostOfficeSerializer,
    AddStaffToPostOfficeSerializer,
)
from apps.users.permissions import (
    ViewShipperProfilePermission,
    ViewPostOfficeStaffProfilePermission,
)
from apps.users.models import User
from apps.users.serializers import (
    UserShipperProfileSerializer,
    UserPostOfficeStaffProfileSerializer,
)
from services.profiles.profile_services import ProfileService
from services.users.user_services import UserService
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

    @extend_schema(request=None, responses=UserShipperProfileSerializer(many=True))
    @action(
        detail=True,
        methods=["get"],
        url_path="shippers",
        permission_classes=[ViewShipperProfilePermission, PostOfficeObjectPermissions],
        filterset_class=None,
    )
    def get_shippers(self, request, pk=None):
        """
        Get all shippers of a post office.
        """

        post_office = self.get_object()
        users = User.objects.filter(shipper_profile__post_office=post_office)
        return self.response_pagination(request, users, UserShipperProfileSerializer)

    @extend_schema(
        request=None, responses=UserPostOfficeStaffProfileSerializer(many=True)
    )
    @action(
        detail=True,
        methods=["get"],
        url_path="post-office-staffs",
        permission_classes=[
            ViewPostOfficeStaffProfilePermission,
            PostOfficeObjectPermissions,
        ],
        filterset_class=None,
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

    @extend_schema(
        request=AddShipperToPostOfficeSerializer,
        responses={status.HTTP_201_CREATED: AddShipperToPostOfficeSerializer},
    )
    @transaction.atomic
    @action(
        detail=True,
        methods=["post"],
        url_path="add-shipper",
        permission_classes=[
            PostOfficeObjectPermissions,
            AddShipperToPostOfficePermissions,
        ],
    )
    def add_shipper_to_post_office(self, request, pk=None):
        """
        Add shipper to post office.
        """

        post_office = self.get_object()
        serializer = AddShipperToPostOfficeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        user_validated_data = validated_data["user"]
        profile_validated_data = validated_data["profile"]

        user = UserService.create(user_validated_data)

        profile_validated_data["post_office"] = post_office
        profile_validated_data["user"] = user

        shipper_profile = ProfileService.create_shipper_profile(profile_validated_data)

        return self.response_created(
            AddShipperToPostOfficeSerializer(
                {"user": user, "profile": shipper_profile}
            ).data
        )

    @extend_schema(
        request=AddStaffToPostOfficeSerializer,
        responses={status.HTTP_201_CREATED: AddStaffToPostOfficeSerializer},
    )
    @transaction.atomic
    @action(
        detail=True,
        methods=["post"],
        url_path="add-staff",
        permission_classes=[
            PostOfficeObjectPermissions,
            AddStaffToPostOfficePermissions,
        ],
    )
    def add_staff_to_post_office(self, request, pk=None):
        """
        Add staff to post office.
        """

        post_office = self.get_object()
        serializer = AddStaffToPostOfficeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        user_validated_data = validated_data["user"]
        profile_validated_data = validated_data["profile"]

        user = UserService.create(user_validated_data)

        profile_validated_data["post_office"] = post_office
        profile_validated_data["user"] = user

        shipper_profile = ProfileService.create_post_office_staff_profile(
            profile_validated_data
        )

        return self.response_created(
            AddStaffToPostOfficeSerializer(
                {"user": user, "profile": shipper_profile}
            ).data
        )
