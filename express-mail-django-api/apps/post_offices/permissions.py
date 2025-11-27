from rest_framework import permissions


class PostOfficeObjectPermissions(permissions.BasePermission):
    """
    Permissions class to check if a user has access
    to a specific PostOffice object.
    """

    def has_object_permission(self, request, view, obj):
        """
        Check if the user manages the given PostOffice object.
        """
        user = request.user

        if not hasattr(user, "post_office_manager_profile"):
            return False

        return user.post_office_manager_profile.post_office == obj
