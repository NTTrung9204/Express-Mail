from django.conf import settings
import requests

from apps.routing.constants import VEHICLE_CAPACITY_MAP


class RoutingService:
    """
    Service class for routing problems.
    """

    @staticmethod
    def solve_vrp(vehicles, jobs, vrp_mode):
        """
        Solving vehicle routing problem.
        """

        params = {
            "api-version": settings.MAP_API_VERSION,
            "apikey": settings.MAP_API_KEY,
        }

        for vehicle in vehicles:
            capacity_map = VEHICLE_CAPACITY_MAP[vehicle["profile"]]
            capacity_list = [
                capacity_map["max_orders"],
                capacity_map["max_volume"],
                capacity_map["max_weight"],
            ]
            vehicle["capacity"] = capacity_list

        for job in jobs:
            job[vrp_mode] = [1] + job.pop("amounts")

        body = {
            "vehicles": vehicles,
            "jobs": jobs,
        }

        response = requests.post(
            settings.MAP_VRP_URL,
            params=params,
            json=body,
            timeout=settings.MAP_API_TIMEOUT,
        )
        response.raise_for_status()

        return response.json()
