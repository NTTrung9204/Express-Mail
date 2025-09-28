from django.contrib.auth.models import Permission, Group
from rest_framework import serializers


class PermissionSerializer(serializers.ModelSerializer):
    """
    Serializer class for the Permission model.
    """

    content_type = serializers.CharField(source="content_type.model", read_only=True)

    class Meta:
        """
        Meta class for PermissionSerializer.
        """

        model = Permission
        fields = ["id", "name", "codename", "content_type"]
        read_only_fields = ["id", "name", "codename", "content_type"]


class GroupSerializer(serializers.ModelSerializer):
    """
    Serializer class for the Group model.
    """

    class Meta:
        """ "
        Meta class for GroupSerializer.
        """

        model = Group
        fields = ["id", "name"]
