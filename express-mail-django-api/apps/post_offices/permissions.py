from rest_framework import permissions


class PostOfficeObjectPermission(permissions.BasePermission):
    """
    Permission class to check if a user has access
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


class AddShipperToPostOfficePermission(permissions.BasePermission):
    """
    Permission class to check if a user has permission to add a shipper to post office.
    """

    def has_permission(self, request, view):
        """
        Check if user has permission to add a shipper to post office.
        """

        user = request.user
        return user.has_perm("post_offices.add_shipper")


class AddStaffToPostOfficePermission(permissions.BasePermission):
    """
    Permission class to check if a user has permission to add a staff to post office.
    """

    def has_permission(self, request, view):
        """
        Check if user has permission to add a staff to post office.
        """

        user = request.user
        return user.has_perm("post_offices.add_staff")


class EditPostOfficeUserPermission(permissions.BasePermission):
    """
    Permission class to check if a user has permission to edit user of a post office..
    """

    def has_permission(self, request, view):
        """
        Check if user has permission to edit user of a post office.
        """

        user = request.user
        return user.has_perm("post_offices.edit_user")


class DeletePostOfficeUserPermission(permissions.BasePermission):
    """
    Permission class to check if a user has permission to delete user of a post office.
    """

    def has_permission(self, request, view):
        """
        Check if user has permission to delete user of a post office.
        """

        user = request.user
        return user.has_perm("post_offices.delete_user")
