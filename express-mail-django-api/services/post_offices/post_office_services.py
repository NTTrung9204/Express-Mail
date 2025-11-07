from apps.post_offices.models import PostOffice
from utils.calculate import Calculate


class PostOfficeService:
    """
    Service class for PostOffice model.
    """

    @staticmethod
    def find_nearest_post_office(latitude, longitude):
        """
        Find nearest post office based on latitude and longitude.
        """

        post_offices = PostOffice.objects.all().values_list(
            "id", "latitude", "longitude"
        )
        if not post_offices:
            return None, None

        nearest_po_id = None
        nearest_distance = None

        for po_id, po_lat, po_lon in post_offices:
            distance = Calculate.haversine(latitude, longitude, po_lat, po_lon)
            if nearest_distance is None or distance < nearest_distance:
                nearest_distance = distance
                nearest_po_id = po_id

        return PostOffice.objects.get(id=nearest_po_id), nearest_distance
