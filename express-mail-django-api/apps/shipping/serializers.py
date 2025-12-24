from rest_framework import serializers

from apps.post_offices.models import PostOffice
from apps.shipping.models import ShippingRate


class ShippingRateSerializer(serializers.ModelSerializer):
    """
    Serializer for the ShippingRateModel.
    """

    class Meta:
        """
        Meta class for ShippingRateSerializer.
        """

        model = ShippingRate
        fields = [
            "id",
            "base_fee",
            "rate_per_km",
            "volumetric_divisor",
            "rate_per_kg",
            "is_active",
            "created_at",
        ]
        read_only_fields = ["id", "is_active", "created_at"]


class CalculateShippingFeeRequestSerializer(serializers.Serializer):
    """
    Serializer for calculating shipping fee request.
    """

    length_cm = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0)
    width_cm = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0)
    height_cm = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0)
    weight_kg = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0)
    post_office = serializers.PrimaryKeyRelatedField(queryset=PostOffice.objects.all())
    receiver_latitude = serializers.DecimalField(max_digits=9, decimal_places=6)
    receiver_longitude = serializers.DecimalField(max_digits=9, decimal_places=6)


class CalculateShippingFeeResponseSerializer(serializers.Serializer):
    """
    Serializer for calculating shipping fee response.
    """

    total_fee = serializers.DecimalField(max_digits=11, decimal_places=2, min_value=0)
    shipping_rate_id = serializers.IntegerField()
    distance_km = serializers.DecimalField(max_digits=20, decimal_places=9)
