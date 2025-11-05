from django.conf import settings
from decimal import Decimal
import requests

from shared.messages import ERROR_MESSAGES


class ShippingRateService:
    """
    Service class for ShippingRate model.
    """

    @staticmethod
    def calculate_shipping_fee(shipping_rate, length, width, height, weight, distance):
        """
        Calculate shipping fee based on shipping rate object and input information.
        """

        distance = Decimal(str(distance))
        weight = Decimal(str(weight))
        length = Decimal(str(length))
        width = Decimal(str(width))
        height = Decimal(str(height))

        total_fee = (
            shipping_rate.base_fee
            + distance * shipping_rate.rate_per_km
            + max(
                weight * shipping_rate.rate_per_kg,
                (length * width * height) / shipping_rate.volumetric_divisor,
            )
        )
        return total_fee

    @staticmethod
    def calculate_distance(
        start_coordinates, end_coordinates, vehicle="truck", capacity=None
    ):
        """
        Calculate distance(km) based on start and end coordinates using external APIs.
        Coordinates(latitude, longitude)
        """

        if vehicle == "truck" and capacity is None:
            raise ValueError(ERROR_MESSAGES["capacity_required_when_vehicle_is_truck"])

        params = {
            "apikey": settings.MAP_API_KEY,
            "point": [
                f"{start_coordinates[0]},{start_coordinates[1]}",
                f"{end_coordinates[0]},{end_coordinates[1]}",
            ],
            "vehicle": vehicle,
        }
        if vehicle == "truck":
            params["capacity"] = capacity

        response = requests.get(
            settings.MAP_ROUTE_URL,
            params=params,
            timeout=settings.MAP_API_TIMEOUT,
        )
        data = response.json()
        response.raise_for_status()

        path_list = data.get("paths", [])
        if not path_list:
            return None

        min_distance = min(p.get("distance", float("inf")) for p in path_list)
        return min_distance / 1000
