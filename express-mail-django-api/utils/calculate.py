import math


class Calculate:
    """
    Service class for calculation.
    """

    @staticmethod
    def haversine(lat1, lon1, lat2, lon2):
        """
        Calculate distance between two points.
        """

        lat1, lon1, lat2, lon2 = map(float, [lat1, lon1, lat2, lon2])
        lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])

        distance_lat = lat2 - lat1
        distance_lon = lon2 - lon1

        a = (
            math.sin(distance_lat / 2) ** 2
            + math.cos(lat1) * math.cos(lat2) * math.sin(distance_lon / 2) ** 2
        )
        c = 2 * math.asin(math.sqrt(a))
        r = 6371  # km
        return c * r
