from apps.users.models import (
    AdminProfile,
    PostOfficeManagerProfile,
    PostOfficeStaffProfile,
    ShopProfile,
)
from shared.constants import Roles


class ProfileService:
    """
    Service class for Profile models.
    """

    @staticmethod
    def create_admin_profile(admin_profile_data):
        """
        Create new AdminProfile instance and return it.
        """

        admin_profile = AdminProfile.objects.create(**admin_profile_data)
        user = admin_profile.user
        if user:
            user.role = Roles.ADMIN.value
            user.save()

        return admin_profile

    @staticmethod
    def create_post_office_manager_profile(post_office_manager_profile_data):
        """
        Create new PostOfficeManagerProfile instance and return it.
        """

        post_office_manager_profile = PostOfficeManagerProfile.objects.create(
            **post_office_manager_profile_data
        )
        user = post_office_manager_profile.user
        if user:
            user.role = Roles.POST_OFFICE_MANAGER.value
            user.save()

        return post_office_manager_profile

    @staticmethod
    def create_post_office_staff_profile(post_office_staff_profile_data):
        """
        Create new PostOfficeStaffProfile instance and return it.
        """

        post_office_staff_profile = PostOfficeStaffProfile.objects.create(
            **post_office_staff_profile_data
        )
        user = post_office_staff_profile.user
        if user:
            user.role = Roles.POST_OFFICE_STAFF.value
            user.save()

        return post_office_staff_profile

    @staticmethod
    def create_shop_profile(shop_profile_data):
        """
        Create new ShopProfile instance and return it.
        """

        shop_profile = ShopProfile.objects.create(**shop_profile_data)
        user = shop_profile.user
        if user:
            user.role = Roles.SHOP.value
            user.save()

        return shop_profile

    @staticmethod
    def update_admin_profile(admin_profile, admin_profile_data):

        """
        Update existing AdminProfile instance and return it.
        """

        for attr, value in admin_profile_data.items():
            setattr(admin_profile, attr, value)

        admin_profile.save()

        user = admin_profile.user
        if user:
            user.role = Roles.ADMIN.value
            user.save()

        return admin_profile

    @staticmethod
    def update_post_office_manager_profile(
        post_office_manager_profile, post_office_manager_profile_data
    ):
        """
        Update existing PostOfficeManagerProfile instance and return it.
        """

        for attr, value in post_office_manager_profile_data.items():
            setattr(post_office_manager_profile, attr, value)

        post_office_manager_profile.save()

        user = post_office_manager_profile.user
        if user:
            user.role = Roles.POST_OFFICE_MANAGER.value
            user.save()

        return post_office_manager_profile

    @staticmethod
    def update_post_office_staff_profile(
        post_office_staff_profile, post_office_staff_profile_data
    ):
        """
        Update existing PostOfficeStaffProfile instance and return it.
        """

        for attr, value in post_office_staff_profile_data.items():
            setattr(post_office_staff_profile, attr, value)

        post_office_staff_profile.save()

        user = post_office_staff_profile.user
        if user:
            user.role = Roles.POST_OFFICE_STAFF.value
            user.save()

        return post_office_staff_profile

    @staticmethod
    def update_shop_profile(shop_profile, shop_profile_data):
        """
        Update existing ShopProfile instance and return it.
        """

        for attr, value in shop_profile_data.items():
            setattr(shop_profile, attr, value)

        shop_profile.save()

        user = shop_profile.user
        if user:
            user.role = Roles.SHOP.value
            user.save()

        return shop_profile
