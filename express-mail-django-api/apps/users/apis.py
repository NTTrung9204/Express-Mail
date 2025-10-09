from django.db import transaction
from drf_spectacular.utils import extend_schema
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import DjangoModelPermissions
from rest_framework.viewsets import ModelViewSet

from apps.users.models import User
from apps.users.serializers import (
    UserSerializer,
    AdminProfileSerializer,
    PostOfficeManagerProfileSerializer,
    PostOfficeStaffProfileSerializer,
    ShopProfileSerializer,
    ShipperProfileSerializer,
)
from services.profiles.profile_services import ProfileService
from services.users.user_services import UserService
from shared.apis import BaseAPIViewSet
from shared.constants import Roles, PROFILE_VIEWSET_ACTION_PERMISSIONS
from shared.permissions import GenericMultiPermission


@extend_schema(tags=["Users"])
class UserViewSet(ModelViewSet, BaseAPIViewSet):
    """
    API endpoint to interact with the User model.
    """

    serializer_class = UserSerializer
    permission_classes = [DjangoModelPermissions]
    queryset = User.objects.all()

    def get_queryset(self):
        """
        If current user is not superuser, return queryset without superuser.
        """

        qs = super().get_queryset()
        if not self.request.user.is_superuser:
            qs = qs.exclude(is_superuser=True)
        return qs

    def perform_create(self, serializer):
        """
        Create a new User instance with hashed password.
        """

        new_user = UserService.create(serializer.validated_data)
        serializer.instance = new_user

    def perform_update(self, serializer):
        """
        Update an existing User instance.
        """

        user = UserService.update(self.get_object(), serializer.validated_data)
        serializer.instance = user

    def perform_destroy(self, instance):
        """
        Prevent deleting superuser.
        """

        delete_user = self.get_object()
        if delete_user.is_superuser:
            raise PermissionDenied()

        instance.delete()


@extend_schema(tags=["Profiles"])
class ProfileViewSet(BaseAPIViewSet):
    """
    API endpoint to interact with the Profile models.
    """

    def get_permissions(self):
        """
        Custom permission for each profile action.
        """

        perms = PROFILE_VIEWSET_ACTION_PERMISSIONS.get(self.action)
        if perms:
            return [GenericMultiPermission(perms)]
        return super().get_permissions()

    @transaction.atomic()
    @action(
        detail=False,
        methods=["post"],
        url_path="admin-profile",
        serializer_class=AdminProfileSerializer,
    )
    def update_create_admin_profile(self, request):
        """
        Update/create AdminProfile for user.
        """

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        admin_profile_data = serializer.validated_data
        user = admin_profile_data.get("user")
        role = user.role

        if role:
            if role != Roles.ADMIN.value:
                # Change profile
                current_profile_name = f"{role.lower()}_profile"
                UserService.detach_profile(user, current_profile_name)
            else:
                # Update profile
                admin_profile = user.admin_profile
                admin_profile_instance = ProfileService.update_admin_profile(
                    admin_profile, admin_profile_data
                )
                return self.response_ok(
                    self.get_serializer(admin_profile_instance).data
                )

        admin_profile_instance = ProfileService.create_admin_profile(admin_profile_data)
        return self.response_created(self.get_serializer(admin_profile_instance).data)

    @transaction.atomic()
    @action(
        detail=False,
        methods=["post"],
        url_path="post-office-manager-profile",
        serializer_class=PostOfficeManagerProfileSerializer,
    )
    def update_create_post_office_manager_profile(self, request):
        """
        Update/create PostOfficeManagerProfile for user.
        """

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        post_office_manager_profile_data = serializer.validated_data
        user = post_office_manager_profile_data.get("user")
        role = user.role

        if role:
            if role != Roles.POST_OFFICE_MANAGER.value:
                # Change profile
                current_profile_name = f"{role.lower()}_profile"
                UserService.detach_profile(user, current_profile_name)
            else:
                # Update profile
                post_office_manager_profile = user.post_office_manager_profile
                post_office_manager_profile_instance = (
                    ProfileService.update_post_office_manager_profile(
                        post_office_manager_profile, post_office_manager_profile_data
                    )
                )
                return self.response_ok(
                    self.get_serializer(post_office_manager_profile_instance).data
                )

        post_office_manager_profile_instance = (
            ProfileService.create_post_office_manager_profile(
                post_office_manager_profile_data
            )
        )
        return self.response_created(
            self.get_serializer(post_office_manager_profile_instance).data
        )

    @transaction.atomic()
    @action(
        detail=False,
        methods=["post"],
        url_path="post-office-staff-profile",
        serializer_class=PostOfficeStaffProfileSerializer,
    )
    def update_create_post_office_staff_profile(self, request):
        """
        Update/create PostOfficeStaffProfile for user.
        """

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        post_office_staff_profile_data = serializer.validated_data
        user = post_office_staff_profile_data.get("user")
        role = user.role

        if role:
            if role != Roles.POST_OFFICE_STAFF.value:
                # Change profile
                current_profile_name = f"{role.lower()}_profile"
                UserService.detach_profile(user, current_profile_name)
            else:
                # Update profile
                post_office_staff_profile = user.post_office_staff_profile
                post_office_staff_profile_instance = (
                    ProfileService.update_post_office_staff_profile(
                        post_office_staff_profile, post_office_staff_profile_data
                    )
                )
                return self.response_ok(
                    self.get_serializer(post_office_staff_profile_instance).data
                )

        post_office_staff_profile_instance = (
            ProfileService.create_post_office_staff_profile(
                post_office_staff_profile_data
            )
        )
        return self.response_created(
            self.get_serializer(post_office_staff_profile_instance).data
        )

    @transaction.atomic()
    @action(
        detail=False,
        methods=["post"],
        url_path="shop-profile",
        serializer_class=ShopProfileSerializer,
    )
    def update_create_shop_profile(self, request):
        """
        Update/create ShopProfile for user.
        """

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        shop_profile_data = serializer.validated_data
        user = shop_profile_data.get("user")
        role = user.role

        if role:
            if role != Roles.SHOP.value:
                # Change profile
                current_profile_name = f"{role.lower()}_profile"
                UserService.detach_profile(user, current_profile_name)
            else:
                # Update profile
                shop_profile = user.shop_profile
                shop_profile_instance = ProfileService.update_shop_profile(
                    shop_profile, shop_profile_data
                )
                return self.response_ok(self.get_serializer(shop_profile_instance).data)

        shop_profile_instance = ProfileService.create_shop_profile(shop_profile_data)
        return self.response_created(self.get_serializer(shop_profile_instance).data)

    @transaction.atomic()
    @action(
        detail=False,
        methods=["post"],
        url_path="shipper-profile",
        serializer_class=ShipperProfileSerializer,
    )
    def update_create_shipper_profile(self, request):
        """
        Update/create ShipperProfile for user.
        """

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        shipper_profile_data = serializer.validated_data
        user = shipper_profile_data.get("user")
        role = user.role

        if role:
            if role != Roles.SHIPPER.value:
                # Change profile
                current_profile_name = f"{role.lower()}_profile"
                UserService.detach_profile(user, current_profile_name)
            else:
                # Update profile
                shipper_profile = user.shipper_profile
                shipper_profile_instance = ProfileService.update_shipper_profile(
                    shipper_profile, shipper_profile_data
                )
                return self.response_ok(
                    self.get_serializer(shipper_profile_instance).data
                )

        shipper_profile_instance = ProfileService.create_shipper_profile(
            shipper_profile_data
        )
        return self.response_created(self.get_serializer(shipper_profile_instance).data)
