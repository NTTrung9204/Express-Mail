from django.db import transaction
from drf_spectacular.utils import extend_schema, OpenApiResponse
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.viewsets import ModelViewSet

from apps.permissions.constants import Roles
from apps.users.constants import PROFILE_VIEWSET_ACTION_PERMISSIONS
from apps.users.models import User
from apps.users.serializers import (
    UserSerializer,
    AdminProfileSerializer,
    PostOfficeManagerProfileSerializer,
    PostOfficeStaffProfileSerializer,
    ShopProfileSerializer,
    ShipperProfileSerializer,
)
from services.permissions.permission_services import PermissionService
from services.profiles.profile_services import ProfileService
from services.users.user_services import UserService
from shared.apis import BaseAPIViewSet
from shared.permissions import GenericMultiPermission, FullDjangoModelPermissions


@extend_schema(tags=["Users"])
class UserViewSet(ModelViewSet, BaseAPIViewSet):
    """
    API endpoint to interact with the User model.
    """

    serializer_class = UserSerializer
    permission_classes = [FullDjangoModelPermissions]
    queryset = User.objects.prefetch_related("exclude_permissions")

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

    @extend_schema(
        description="Get profile of a user (response structure depends on user role)",
        responses={
            200: OpenApiResponse(
                description="Dynamic profile data (varies by user role)"
            )
        },
    )
    @action(detail=True, methods=["get"], url_path="profile")
    def profile(self, request, pk=None):
        """
        Get profile of a user.
        """

        user = self.get_object()
        profile = ProfileService.get_profile(user)
        data = ProfileService.serialize_profile(profile)

        return self.response_ok(data)


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

    def _update_or_create_profile(
        self,
        request,
        serializer_class,
        role_value,
        update_func,
        create_func,
        user_profile_attr_name,
    ):
        serializer = serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        profile_data = serializer.validated_data

        exclude_permissions = profile_data.pop("exclude_permissions", None)
        user = profile_data.get("user")
        PermissionService.update_exclude_permissions(user, exclude_permissions)

        role = user.role
        if role:
            if role != role_value:
                # Change profile
                current_profile_name = f"{role.lower()}_profile"
                UserService.detach_profile(user, current_profile_name)
            else:
                # Update profile
                current_profile = getattr(user, user_profile_attr_name)
                instance = update_func(current_profile, profile_data)
                return self.response_ok(serializer_class(instance).data)

        # Create profile
        instance = create_func(profile_data)
        return self.response_created(serializer_class(instance).data)

    @transaction.atomic()
    @action(
        detail=False,
        methods=["post"],
        url_path="admin-profile",
        serializer_class=AdminProfileSerializer,
    )
    def update_create_admin_profile(self, request):
        return self._update_or_create_profile(
            request,
            serializer_class=AdminProfileSerializer,
            role_value=Roles.ADMIN.value,
            update_func=ProfileService.update_admin_profile,
            create_func=ProfileService.create_admin_profile,
            user_profile_attr_name="admin_profile",
        )

    @transaction.atomic()
    @action(
        detail=False,
        methods=["post"],
        url_path="post-office-manager-profile",
        serializer_class=PostOfficeManagerProfileSerializer,
    )
    def update_create_post_office_manager_profile(self, request):
        return self._update_or_create_profile(
            request,
            serializer_class=PostOfficeManagerProfileSerializer,
            role_value=Roles.POST_OFFICE_MANAGER.value,
            update_func=ProfileService.update_post_office_manager_profile,
            create_func=ProfileService.create_post_office_manager_profile,
            user_profile_attr_name="post_office_manager_profile",
        )

    @transaction.atomic()
    @action(
        detail=False,
        methods=["post"],
        url_path="post-office-staff-profile",
        serializer_class=PostOfficeStaffProfileSerializer,
    )
    def update_create_post_office_staff_profile(self, request):
        return self._update_or_create_profile(
            request,
            serializer_class=PostOfficeStaffProfileSerializer,
            role_value=Roles.POST_OFFICE_STAFF.value,
            update_func=ProfileService.update_post_office_staff_profile,
            create_func=ProfileService.create_post_office_staff_profile,
            user_profile_attr_name="post_office_staff_profile",
        )

    @transaction.atomic()
    @action(
        detail=False,
        methods=["post"],
        url_path="shop-profile",
        serializer_class=ShopProfileSerializer,
    )
    def update_create_shop_profile(self, request):
        return self._update_or_create_profile(
            request,
            serializer_class=ShopProfileSerializer,
            role_value=Roles.SHOP.value,
            update_func=ProfileService.update_shop_profile,
            create_func=ProfileService.create_shop_profile,
            user_profile_attr_name="shop_profile",
        )

    @transaction.atomic()
    @action(
        detail=False,
        methods=["post"],
        url_path="shipper-profile",
        serializer_class=ShipperProfileSerializer,
    )
    def update_create_shipper_profile(self, request):
        return self._update_or_create_profile(
            request,
            serializer_class=ShipperProfileSerializer,
            role_value=Roles.SHIPPER.value,
            update_func=ProfileService.update_shipper_profile,
            create_func=ProfileService.create_shipper_profile,
            user_profile_attr_name="shipper_profile",
        )
