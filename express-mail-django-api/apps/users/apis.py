from django.db import transaction
from drf_spectacular.utils import extend_schema, OpenApiResponse
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.viewsets import ModelViewSet
from rest_framework import status

from apps.permissions.constants import Roles, Groups
from apps.users.constants import PROFILE_VIEWSET_ACTION_PERMISSIONS
from apps.users.filters import UserFilter
from apps.users.models import User
from apps.users.permissions import ProfileObjectPermission
from apps.users.serializers import (
    UserSerializer,
    AdminProfileSerializer,
    PostOfficeManagerProfileSerializer,
    PostOfficeStaffProfileSerializer,
    ShopProfileSerializer,
    ShipperProfileSerializer,
    ResetPasswordRequestSerializer,
    VerifyResetPasswordOTPSerializer,
    ResetPasswordConfirmSerializer,
    GetNameListRequestSerializer,
    GetNameListResponseSerializer,
    ShopRegisterSerializer,
    ChangeUserStatusRequestSerializer,
    ChangeUserPasswordRequestSerializer,
)
from apps.users.throttling import (
    OTPRequestThrottle,
    OTPVerifyThrottle,
    OTPConfirmThrottle,
)
from services.groups.group_services import GroupService
from services.permissions.permission_services import PermissionService
from services.profiles.profile_services import ProfileService
from services.users.password_reset_otp_services import PasswordResetOTPService
from services.users.user_services import UserService
from shared.apis import BaseAPIViewSet
from shared.permissions import (
    GenericMultiPermission,
    FullDjangoModelPermissions,
    IsUserAuthenticated,
)
from utils.generators import Generator
from apps.users.tasks import send_reset_password_otp_task, send_init_password_email_task


@extend_schema(tags=["Users"])
class UserViewSet(ModelViewSet, BaseAPIViewSet):
    """
    API endpoint to interact with the User model.
    """

    serializer_class = UserSerializer
    filterset_class = UserFilter
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

        data = serializer.validated_data.copy()
        password = Generator.generate_random_password()
        data["password"] = password

        new_user = UserService.create(data)

        send_init_password_email_task(new_user.email, password)

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
            status.HTTP_200_OK: OpenApiResponse(
                description="Dynamic profile data (varies by user role)"
            )
        },
    )
    @action(
        detail=True,
        methods=["get"],
        url_path="profile",
        permission_classes=[ProfileObjectPermission],
    )
    def profile(self, request, pk=None):
        """
        Get profile of a user.
        """

        user = self.get_object()
        profile = ProfileService.get_profile(user)
        data = ProfileService.serialize_profile(profile)

        return self.response_ok(data)

    @extend_schema(
        request=GetNameListRequestSerializer,
        responses={status.HTTP_200_OK: GetNameListResponseSerializer(many=True)},
    )
    @action(
        detail=False,
        methods=["post"],
        url_path="name_list",
        permission_classes=[],
        pagination_class=None,
    )
    def get_name_list_by_ids(self, request):
        """
        Get name list by list of user ids.
        """

        request_serializer = GetNameListRequestSerializer(data=request.data)
        request_serializer.is_valid(raise_exception=True)

        users = request_serializer.validated_data["users"]
        data = GetNameListResponseSerializer(instance=users, many=True).data

        return self.response_ok(data)

    @extend_schema(
        request=ShopRegisterSerializer,
        responses={status.HTTP_201_CREATED: ShopRegisterSerializer},
    )
    @transaction.atomic
    @action(
        methods=["post"], detail=False, url_path="shop-register", permission_classes=[]
    )
    def shop_register(self, request):
        """
        Register a new shop account.
        """

        serializer = ShopRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        user_validated_data = validated_data["user"]
        profile_validated_data = validated_data["profile"]

        created_user = UserService.create(user_validated_data)
        profile_validated_data["user"] = created_user

        created_shop_profile = ProfileService.create_shop_profile(
            profile_validated_data
        )

        created_user.groups.add(GroupService.get_group_by_name(Groups.SHOP.value))

        shop_register_data = {
            "user": created_user,
            "profile": created_shop_profile,
        }

        return self.response(
            data=ShopRegisterSerializer(instance=shop_register_data).data,
            status_code=status.HTTP_201_CREATED,
        )

    @extend_schema(
        request=ChangeUserStatusRequestSerializer,
        responses={status.HTTP_200_OK: OpenApiResponse()},
    )
    @action(methods=["put"], detail=True, url_path="status")
    def change_user_status(self, request, pk=None):
        """
        Change user status(active/inactive).
        """

        user = self.get_object()

        serializer = ChangeUserStatusRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data
        is_active = validated_data["is_active"]

        UserService.change_status(user, is_active)

        return self.response_ok()

    @extend_schema(
        request=ChangeUserPasswordRequestSerializer,
        responses={status.HTTP_200_OK: OpenApiResponse()},
    )
    @action(
        methods=["post"],
        detail=False,
        url_path="change-password",
        permission_classes=[IsUserAuthenticated],
    )
    def change_password(self, request):
        """
        Change password for current user.
        """

        serializer = ChangeUserPasswordRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        password = serializer.validated_data["password"]
        user = request.user

        UserService.change_password(user, password)

        return self.response_ok()


@extend_schema(tags=["Reset Password"])
class ResetPasswordViewSet(BaseAPIViewSet):
    """
    Reset password API endpoint.
    """

    @extend_schema(
        request=ResetPasswordRequestSerializer,
        responses={status.HTTP_200_OK: OpenApiResponse()},
    )
    @action(
        detail=False,
        methods=["post"],
        url_path="request",
        serializer_class=ResetPasswordRequestSerializer,
        permission_classes=[],
        throttle_classes=[OTPRequestThrottle],
    )
    def request_reset_password(self, request):
        """
        Reset password request endpoint.
        """

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reset_password_request_data = serializer.validated_data
        email = reset_password_request_data.pop("email", None)

        user = UserService.get_user_by_email(email)
        if user:
            otp = Generator.generate_otp()
            PasswordResetOTPService.create_password_reset_otp(user, otp)
            send_reset_password_otp_task.delay.send_reset_password_otp(user.email, otp)

        return self.response_ok()

    @action(
        detail=False,
        methods=["post"],
        url_path="verify",
        serializer_class=VerifyResetPasswordOTPSerializer,
        permission_classes=[],
        throttle_classes=[OTPVerifyThrottle],
    )
    def verify_reset_password_otp(self, request):
        """
        Verify reset password otp endpoint.
        """

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        verify_data = serializer.validated_data

        email = verify_data.pop("email", None)
        otp = verify_data.pop("otp", None)

        user = UserService.get_user_by_email(email)
        if user:
            latest_password_reset_otp = (
                PasswordResetOTPService.get_latest_available_password_reset_otp(user)
            )
            if latest_password_reset_otp and latest_password_reset_otp.check_otp(otp):
                return self.response_ok()

        return self.response_error(
            "invalid_credentials", status_code=status.HTTP_400_BAD_REQUEST
        )

    @action(
        detail=False,
        methods=["post"],
        url_path="confirm",
        serializer_class=ResetPasswordConfirmSerializer,
        permission_classes=[],
        throttle_classes=[OTPConfirmThrottle],
    )
    def confirm_reset_password(self, request):
        """
        Confirm reset password endpoint.
        """

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        confirm_data = serializer.validated_data

        email = confirm_data.pop("email", None)
        otp = confirm_data.pop("otp", None)
        new_password = confirm_data.pop("new_password", None)

        user = UserService.get_user_by_email(email)
        if user:
            latest_password_reset_otp = (
                PasswordResetOTPService.get_latest_available_password_reset_otp(user)
            )
            if latest_password_reset_otp and latest_password_reset_otp.check_otp(otp):
                UserService.update_password(user, new_password)
                latest_password_reset_otp.mark_used()
                return self.response_ok()

        return self.response_error(
            "invalid_credentials", status_code=status.HTTP_400_BAD_REQUEST
        )


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

        user.remove_all_groups()
        user.groups.add(GroupService.get_group_by_name(role_value))

        return self.response_created(serializer_class(instance).data)

    @transaction.atomic
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

    @transaction.atomic
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

    @transaction.atomic
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

    @transaction.atomic
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

    @transaction.atomic
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
