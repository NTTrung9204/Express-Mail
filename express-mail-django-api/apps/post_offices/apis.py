from django.db import transaction
from drf_spectacular.utils import extend_schema, OpenApiResponse
from rest_framework.decorators import action
from rest_framework.viewsets import ModelViewSet
from rest_framework import status

from apps.post_offices.filters import PostOfficeFilter
from apps.post_offices.models import PostOffice
from apps.post_offices.permissions import (
    PostOfficeObjectPermission,
    AddShipperToPostOfficePermission,
    AddStaffToPostOfficePermission,
    EditPostOfficeUserPermission,
)
from apps.post_offices.serializers import (
    PostOfficeSerializer,
    AddShipperToPostOfficeSerializer,
    AddStaffToPostOfficeSerializer,
    ChangePostOfficeUserStatusRequestSerializer,
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
from services.post_offices.post_office_services import PostOfficeService
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
        permission_classes=[ViewShipperProfilePermission, PostOfficeObjectPermission],
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
            PostOfficeObjectPermission,
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
            PostOfficeObjectPermission,
            AddShipperToPostOfficePermission,
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
            PostOfficeObjectPermission,
            AddStaffToPostOfficePermission,
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

    @extend_schema(
        request=ChangePostOfficeUserStatusRequestSerializer,
        responses={status.HTTP_200_OK: OpenApiResponse()},
    )
    @action(
        methods=["put"],
        detail=True,
        url_path="user-status",
        permission_classes=[PostOfficeObjectPermission, EditPostOfficeUserPermission],
    )
    def change_user_status(self, request, pk=None):
        """
        Change post office user status(active/inactive).
        """

        post_office = self.get_object()

        serializer = ChangePostOfficeUserStatusRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        user = validated_data["user"]
        is_active = validated_data["is_active"]

        if not PostOfficeService.check_user_belong_to_post_office(user, post_office):
            return self.response_error(
                "user_not_belong_to_post_office", status_code=status.HTTP_404_NOT_FOUND
            )

        UserService.change_status(user, is_active)
        return self.response_ok()
