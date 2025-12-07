from django.db import transaction
from drf_spectacular.utils import extend_schema, OpenApiResponse
from rest_framework.decorators import action
from rest_framework.generics import get_object_or_404
from rest_framework.viewsets import ModelViewSet
from rest_framework import status

from apps.permissions.constants import Groups
from apps.post_offices.filters import PostOfficeFilter
from apps.post_offices.models import PostOffice
from apps.post_offices.permissions import (
    PostOfficeObjectPermission,
    AddShipperToPostOfficePermission,
    AddStaffToPostOfficePermission,
    EditPostOfficeUserPermission,
    DeletePostOfficeUserPermission,
)
from apps.post_offices.serializers import (
    PostOfficeSerializer,
    ShipperInPostOfficeSerializer,
    StaffInPostOfficeSerializer,
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
from services.groups.group_services import GroupService
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

    @extend_schema(
        request=ShipperInPostOfficeSerializer,
        responses={
            status.HTTP_200_OK: UserShipperProfileSerializer(many=True),
            status.HTTP_201_CREATED: ShipperInPostOfficeSerializer,
        },
    )
    @transaction.atomic
    @action(
        detail=True,
        methods=["get", "post"],
        url_path="shippers",
        permission_classes=[],
        filterset_class=[],
    )
    def shippers(self, request, pk=None):
        """
        API endpoint interact with shipper in post office.
        """

        post_office = self.get_object()

        method_permissions = {
            "GET": [ViewShipperProfilePermission, PostOfficeObjectPermission],
            "POST": [AddShipperToPostOfficePermission, PostOfficeObjectPermission],
        }
        for perm in method_permissions[request.method]:
            p = perm()
            if not p.has_permission(request, self) or not p.has_object_permission(
                request, self, post_office
            ):
                self.permission_denied(request)

        if request.method == "GET":
            users = User.objects.filter(shipper_profile__post_office=post_office)
            return self.response_pagination(
                request, users, UserShipperProfileSerializer
            )

        elif request.method == "POST":
            serializer = ShipperInPostOfficeSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            validated_data = serializer.validated_data

            user_validated_data = validated_data["user"]
            profile_validated_data = validated_data["profile"]

            user = UserService.create(user_validated_data)
            profile_validated_data.update({"post_office": post_office, "user": user})
            shipper_profile = ProfileService.create_shipper_profile(
                profile_validated_data
            )

            user.groups.add(GroupService.get_group_by_name(Groups.SHIPPER.value))

            return self.response_created(
                ShipperInPostOfficeSerializer(
                    {"user": user, "profile": shipper_profile}
                ).data
            )

    @extend_schema(
        request=StaffInPostOfficeSerializer,
        responses={
            status.HTTP_200_OK: UserPostOfficeStaffProfileSerializer(many=True),
            status.HTTP_201_CREATED: StaffInPostOfficeSerializer,
        },
    )
    @transaction.atomic
    @action(
        detail=True,
        methods=["get", "post"],
        url_path="staffs",
        permission_classes=[],
        filterset_class=[],
    )
    def staffs(self, request, pk=None):
        """
        API endpoint interact with staff in post office.
        """

        post_office = self.get_object()

        method_permissions = {
            "GET": [ViewPostOfficeStaffProfilePermission, PostOfficeObjectPermission],
            "POST": [PostOfficeObjectPermission, AddStaffToPostOfficePermission],
        }

        for perm_class in method_permissions[request.method]:
            if not perm_class().has_object_permission(request, self, post_office):
                self.permission_denied(request)

        if request.method == "GET":
            users = User.objects.filter(
                post_office_staff_profile__post_office=post_office
            )
            return self.response_pagination(
                request, users, UserPostOfficeStaffProfileSerializer
            )

        elif request.method == "POST":
            serializer = StaffInPostOfficeSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            validated_data = serializer.validated_data

            user_data = validated_data["user"]
            profile_data = validated_data["profile"]

            user = UserService.create(user_data)

            profile_data["post_office"] = post_office
            profile_data["user"] = user

            staff_profile = ProfileService.create_post_office_staff_profile(
                profile_data
            )

            user.groups.add(
                GroupService.get_group_by_name(Groups.POST_OFFICE_STAFF.value)
            )

            return self.response_created(
                StaffInPostOfficeSerializer(
                    {"user": user, "profile": staff_profile}
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

    @extend_schema(
        request=ShipperInPostOfficeSerializer, responses=ShipperInPostOfficeSerializer
    )
    @action(
        methods=["put"],
        detail=True,
        url_path=r"shippers/(?P<user_id>\d+)",
        permission_classes=[PostOfficeObjectPermission, EditPostOfficeUserPermission],
    )
    def update_shippers(self, request, pk=None, user_id=None):
        """
        Update shipper of a post office
        """

        post_office = self.get_object()
        shipper = get_object_or_404(
            User, id=user_id, shipper_profile__post_office=post_office
        )

        serializer = ShipperInPostOfficeSerializer(
            instance={
                "user": shipper,
                "profile": shipper.shipper_profile,
            },
            data=request.data,
        )
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        user_validated_data = validated_data["user"]
        profile_validated_data = validated_data["profile"]

        user = UserService.update(shipper, user_validated_data)
        profile = ProfileService.update_shipper_profile(
            shipper.shipper_profile, profile_validated_data
        )

        return self.response_ok(
            ShipperInPostOfficeSerializer(
                instance={"user": user, "profile": profile}
            ).data
        )

    @extend_schema(
        request=StaffInPostOfficeSerializer, responses=StaffInPostOfficeSerializer
    )
    @action(
        methods=["put"],
        detail=True,
        url_path=r"staffs/(?P<user_id>\d+)",
        permission_classes=[PostOfficeObjectPermission, EditPostOfficeUserPermission],
    )
    def update_post_office_staff(self, request, pk=None, user_id=None):
        """
        Update staff of a post office
        """

        post_office = self.get_object()
        staff = get_object_or_404(
            User, id=user_id, post_office_staff_profile__post_office=post_office
        )

        serializer = StaffInPostOfficeSerializer(
            instance={
                "user": staff,
                "profile": staff.post_office_staff_profile,
            },
            data=request.data,
        )
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        user_validated_data = validated_data["user"]
        profile_validated_data = validated_data["profile"]

        user = UserService.update(staff, user_validated_data)
        profile = ProfileService.update_post_office_staff_profile(
            staff.post_office_staff_profile, profile_validated_data
        )

        return self.response_ok(
            StaffInPostOfficeSerializer(
                instance={"user": user, "profile": profile}
            ).data
        )

    @action(
        methods=["delete"],
        detail=True,
        url_path=r"users/(?P<user_id>\d+)",
        permission_classes=[PostOfficeObjectPermission, DeletePostOfficeUserPermission],
    )
    def delete_post_office_user(self, request, pk=None, user_id=None):
        """
        Delete post office user.
        """

        post_office = self.get_object()
        user = get_object_or_404(User, id=user_id)
        if not PostOfficeService.check_user_belong_to_post_office(user, post_office):
            return self.response_error(
                "user_not_belong_to_post_office", status_code=status.HTTP_404_NOT_FOUND
            )

        UserService.delete(user)

        return self.response(status_code=status.HTTP_204_NO_CONTENT)
