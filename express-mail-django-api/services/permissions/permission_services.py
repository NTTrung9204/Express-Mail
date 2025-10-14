class PermissionService:
    """
    Service class for Permission model.
    """

    @staticmethod
    def update_exclude_permissions(user, exclude_permissions):
        """
        Handle PUT exclude permissions of user.
        """

        print(exclude_permissions, "wtf")
        user.exclude_permissions.clear()
        if exclude_permissions:
            user.exclude_permissions.add(*exclude_permissions)
