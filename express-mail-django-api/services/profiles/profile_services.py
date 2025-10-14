from apps.permissions.constants import Roles
from apps.users.constants import PROFILE_SERIALIZER_MAP
from apps.users.models import (
    AdminProfile,
    PostOfficeManagerProfile,
    PostOfficeStaffProfile,
    ShopProfile,
    ShipperProfile,
)


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
    def create_shipper_profile(shipper_profile_data):
        """
        Create new ShipperProfile instance and return it.
        """

        shipper_profile = ShipperProfile.objects.create(**shipper_profile_data)
        user = shipper_profile.user
        if user:
            user.role = Roles.SHIPPER.value
            user.save()

        return shipper_profile

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

    @staticmethod
    def update_shipper_profile(shipper_profile, shipper_profile_data):
        """
        Update existing ShipperProfile instance and return it.
        """

        for attr, value in shipper_profile_data.items():
            setattr(shipper_profile, attr, value)

        shipper_profile.save()

        user = shipper_profile.user
        if user:
            user.role = Roles.SHIPPER.value
            user.save()

        return shipper_profile

    @staticmethod
    def get_profile(user):
        """
        Get profile for a given user.
        """

        role = user.role
        if role and role != Roles.SUPER_ADMIN.value:
            return getattr(user, f"{role}_profile", None)
        return None

    @staticmethod
    def serialize_profile(profile):
        """
        Get data(dict) from given profile.
        """

        for model_class, serializer_class in PROFILE_SERIALIZER_MAP.items():
            if isinstance(profile, model_class):
                return serializer_class(instance=profile).data
        return None
