from apps.post_offices.constants import MAX_DISTANCE_TO_ADD_SHOP
from services.post_offices.post_office_services import PostOfficeService
from rest_framework import serializers

from shared.messages import ERROR_MESSAGES


class ShopLocationValidationMixin:
    """
    Mixin use to check if there is post office nearby shop location.
    """

    def validate_location(self, attrs, instance=None):
        """
        Check if there is post office nearby shop.
        """

        latitude = attrs.get("latitude") or instance.latitude
        longitude = attrs.get("longitude") or instance.longitude

        nearest_post_office, distance = PostOfficeService.find_nearest_post_office(
            latitude, longitude
        )

        if nearest_post_office is not None:
            if distance > MAX_DISTANCE_TO_ADD_SHOP:
                raise serializers.ValidationError(
                    {"detail": ERROR_MESSAGES["no_post_office_near_by"]}
                )
            attrs["post_office"] = nearest_post_office
        else:
            raise serializers.ValidationError(
                {"detail": ERROR_MESSAGES["no_post_office_exist"]}
            )

        return attrs
