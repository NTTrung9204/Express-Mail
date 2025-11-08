from rest_framework.permissions import BasePermission


class CanCallVRP(BasePermission):
    """
    Allows access only to users with the 'routing.call_vrp' permission.
    """

    def has_permission(self, request, view):
        """
        Check if user has 'routing.call_vrp' permission.
        """

        return (
            request.user
            and request.user.is_authenticated
            and request.user.has_perm("routing.call_vrp")
        )
