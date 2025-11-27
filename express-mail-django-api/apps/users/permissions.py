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


class ViewShipperProfilePermission(permissions.BasePermission):
    """
    Permission class check if user has users.view_shipperprofile permission.
    """

    def has_permission(self, request, view):
        """
        Check if user has users.view_shipperprofile permission.
        """

        user = request.user
        return user.has_perm("users.view_shipperprofile")


class ViewPostOfficeStaffProfilePermission(permissions.BasePermission):
    """
    Permission class check if user has users.view_postofficestaffprofile permission.
    """

    def has_permission(self, request, view):
        """
        Check if user has users.view_postofficestaffprofile permission.
        """

        user = request.user
        return user.has_perm("users.view_postofficestaffprofile")
