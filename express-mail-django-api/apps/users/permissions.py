from rest_framework import permissions


class ProfileObjectPermission(permissions.BasePermission):
    """
    Object-level permission:
    - Users with 'users.view_user' permission can view any profile.
    - Other users can view only their own profile.
    """

    def has_object_permission(self, request, view, obj):
        """
        Perform check profile object permission.
        """

        user = request.user

        if user.has_perm("users.view_user"):
            return True

        return obj == user
