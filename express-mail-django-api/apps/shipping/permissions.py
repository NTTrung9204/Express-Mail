from rest_framework.permissions import BasePermission


class CanChangeShippingRateStatus(BasePermission):
    """
    Allows access only to users with the 'shipping.change_shippingrate_status' permission.
    """

    def has_permission(self, request, view):
        """
        Check if user has 'shipping.change_shippingrate_status' permission.
        """

        return (
            request.user
            and request.user.is_authenticated
            and request.user.has_perm("shipping.change_shippingrate_status")
        )
