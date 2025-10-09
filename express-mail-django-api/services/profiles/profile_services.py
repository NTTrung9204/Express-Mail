from apps.users.models import AdminProfile, PostOfficeManagerProfile
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
