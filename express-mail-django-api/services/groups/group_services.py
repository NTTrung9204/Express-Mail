from django.contrib.auth.models import Group


class GroupService:
    """
    Service class for Group model.
    """

    @staticmethod
    def get_permissions_of_group(group_name):
        """
        Get all permissions of a group.
        """

        return Group.objects.get(name=group_name).permissions.all()
