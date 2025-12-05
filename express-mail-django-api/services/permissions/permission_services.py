from utils.encrypt import Encrypt
from utils.gzip import GzipString
from django.conf import settings


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

    @staticmethod
    def encrypt_permissions(permissions):
        """
        Encrypt set of permissions into a string.
        """

        str_permissions = ",".join(sorted(permissions)) if permissions else ""
        gzip_base64_encode = GzipString.encode(str_permissions)
        encrypt_password = settings.ENCRYPT_PASSWORD
        return Encrypt.encrypt_text(gzip_base64_encode, encrypt_password)
