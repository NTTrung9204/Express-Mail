from rest_framework import serializers

from apps.post_offices.models import PostOffice
from apps.users.models import ShipperProfile, PostOfficeStaffProfile
from apps.users.serializers import UserRegisterSerializer
from apps.users.models import User


class PostOfficeSerializer(serializers.ModelSerializer):
    """
    Serializer class for PostOffice model.
    """

    class Meta:
        """
        Meta class for PostOfficeSerializer.
        """

        model = PostOffice
        fields = [
            "id",
            "name",
            "address",
            "ward_commune",
            "province_city",
            "district",
            "latitude",
            "longitude",
        ]


class PostOfficeShipperProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for shipper in a post office..
    """

    class Meta:
        """
        Meta class for PostOfficeShipperProfileSerializer.
        """

        model = ShipperProfile
        fields = [
            "phone_number",
            "address",
            "motor_model",
            "license_plate_number",
            "card_id",
            "avatar",
        ]


class PostOfficeStaffProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for staff in a post office.
    """

    class Meta:
        """
        Meta class for PostOfficeStaffSerializer.
        """

        model = PostOfficeStaffProfile
        fields = []


class ShipperInPostOfficeSerializer(serializers.Serializer):
    """
    Serializer class for add shipper to post office.
    """

    user = UserRegisterSerializer()
    profile = PostOfficeShipperProfileSerializer()

    def get_fields(self):
        """
        Init instance for nested model serializer if updating is happening.
        """

        fields = super().get_fields()

        if self.instance:
            fields["user"].instance = self.instance.get("user")
            fields["profile"].instance = self.instance.get("profile")

        return fields


class StaffInPostOfficeSerializer(serializers.Serializer):
    """
    Serializer class for add staff to post office.
    """

    user = UserRegisterSerializer()
    profile = PostOfficeStaffProfileSerializer()

    def get_fields(self):
        """
        Init instance for nested model serializer if updating is happening.
        """

        fields = super().get_fields()

        if self.instance:
            fields["user"].instance = self.instance.get("user")
            fields["profile"].instance = self.instance.get("profile")

        return fields


class ChangePostOfficeUserStatusRequestSerializer(serializers.Serializer):
    """
    Serializer class for change post office user status.
    """

    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    is_active = serializers.BooleanField()
