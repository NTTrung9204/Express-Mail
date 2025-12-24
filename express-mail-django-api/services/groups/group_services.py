from django.contrib.auth.models import Group
from django.contrib.auth.models import Permission


class GroupService:
    """
    Service class for Group model.
    """

    @staticmethod
    def get_permissions_of_group(group_name):
        """
        Get all permissions of a group.
        """

        return Permission.objects.filter(group__name=group_name)

    @staticmethod
    def get_group_by_name(group_name):
        """
        Get group by name.
        """

        try:
            group = Group.objects.get(name=group_name)
            return group
        except Group.DoesNotExist:
            return None
