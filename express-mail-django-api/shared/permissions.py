from django.contrib.auth.backends import ModelBackend
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

        user = request.user
        return bool(user and user.is_authenticated and user.has_perms(self.perm_list))


class ExcludePermissionModelBackend(ModelBackend):
    """
    Custom ModelBackend class for exclude permission case.
    """

    def get_all_permissions(self, user_obj, obj=None):
        """
        Remove exclude permissions out of original all permissions.
        """

        perms = super().get_all_permissions(user_obj, obj)
        excluded = {
            f"{perm.content_type.app_label}.{perm.codename}"
            for perm in user_obj.exclude_permissions.all()
        }
        return perms - excluded
