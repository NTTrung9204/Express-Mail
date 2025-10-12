from rest_framework.permissions import BasePermission, DjangoModelPermissions


class FullDjangoModelPermissions(DjangoModelPermissions):
    """
    Extended version of DjangoModelPermissions that also enforces `view_` permissions.
    """

    perms_map = {
        "GET": ["%(app_label)s.view_%(model_name)s"],
        "OPTIONS": [],
        "HEAD": [],
        "POST": ["%(app_label)s.add_%(model_name)s"],
        "PUT": ["%(app_label)s.change_%(model_name)s"],
        "PATCH": ["%(app_label)s.change_%(model_name)s"],
        "DELETE": ["%(app_label)s.delete_%(model_name)s"],
    }


class GenericMultiPermission(BasePermission):
    """
    Check that user has all required permissions.
    Accepts a list of permission strings in the form "app_label.codename".
    """

    def __init__(self, perm_list):
        """
        perm_list: list of permission strings "app_label.codename"
        """

        self.perm_list = perm_list

    def has_permission(self, request, view):
        """
        Check if user has all required permissions.
        """

        if not request.user or not request.user.is_authenticated:
            return False

        for perm in self.perm_list:
            if not request.user.has_perm(perm):
                return False
        return True
