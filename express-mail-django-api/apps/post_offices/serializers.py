from rest_framework import serializers

from apps.post_offices.models import PostOffice
from apps.users.models import ShipperProfile, PostOfficeStaffProfile
from apps.users.serializers import UserRegisterSerializer


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


class ShipperProfileToAddToPostOfficeSerializer(serializers.ModelSerializer):
    """
    Serializer for shipper who will be added to a post office.
    """

    class Meta:
        """
        Meta class for ShipperProfileToAddToPostOfficeSerializer.
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


class StaffProfileToAddToPostOfficeSerializer(serializers.ModelSerializer):
    """
    Serializer for staff who will be added to a post office.
    """

    class Meta:
        """
        Meta class for StaffProfileToAddToPostOfficeSerializer.
        """

        model = PostOfficeStaffProfile
        fields = []


class AddShipperToPostOfficeSerializer(serializers.Serializer):
    """
    Serializer class for add shipper to post office.
    """

    user = UserRegisterSerializer()
    profile = ShipperProfileToAddToPostOfficeSerializer()


class AddStaffToPostOfficeSerializer(serializers.Serializer):
    """
    Serializer class for add staff to post office.
    """

    user = UserRegisterSerializer()
    profile = StaffProfileToAddToPostOfficeSerializer()
