from rest_framework import permissions


class IsAdminAuthenticated(permissions.BasePermission):
    """
    Permission class to check if user is admin or not.
    """

    def has_permission(self, request, view):
        """
        Check if user is admin or not.
        """

        return request.user.is_authenticated and request.user.is_superuser
