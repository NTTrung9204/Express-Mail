from rest_framework import serializers

from apps.routing.constants import Vehicles, VRPMode


class JobSerializer(serializers.Serializer):
    """
    Serializer for jobs field in external VRP API.
    """

    id = serializers.IntegerField()
    location = serializers.ListField(
        child=serializers.FloatField(),
        min_length=2,
        max_length=2,
        help_text="[long, lat]",
    )
    amounts = serializers.ListField(
        child=serializers.FloatField(),
        min_length=2,
        max_length=2,
        help_text="[volume(cm3), weight(g)]",
    )


class VehicleSerializer(serializers.Serializer):
    """
    Serializer for vehicles field in external VRP API.
    """

    id = serializers.IntegerField()
    start = serializers.ListField(
        child=serializers.FloatField(),
        min_length=2,
        max_length=2,
        help_text="[long, lat]",
    )
    end = serializers.ListField(
        child=serializers.FloatField(),
        min_length=2,
        max_length=2,
        help_text="[long, lat]",
    )
    profile = serializers.ChoiceField(choices=Vehicles.choices())


class VRPRequestSerializer(serializers.Serializer):
    """
    Serializer for VRP request in external VRP API.
    """

    vehicles = VehicleSerializer(many=True)
    jobs = JobSerializer(many=True)
    mode = serializers.ChoiceField(choices=VRPMode.choices())
