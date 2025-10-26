from rest_framework import serializers

from apps.post_offices.models import PostOffice


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
            "latitude",
            "longitude",
        ]
