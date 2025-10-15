class PermissionService:
    """
    Service class for Permission model.
    """

    @staticmethod
    def update_exclude_permissions(user, exclude_permissions):
        """
        Handle PUT exclude permissions of user.
        """

        user.exclude_permissions.clear()
        if exclude_permissions:
            user.exclude_permissions.add(*exclude_permissions)

    @staticmethod
    def get_permissions_of_group(group):
        """
        Get all permissions of a group.
        """

        return group.permissions.all()
