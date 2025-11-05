from drf_spectacular.utils import extend_schema, OpenApiResponse
from rest_framework.decorators import action

from apps.routing.serializers import VRPRequestSerializer
from services.routing.routing_services import RoutingService
from shared.apis import BaseAPIViewSet
from rest_framework import status
import requests


@extend_schema(tags=["Routing"])
class RoutingViewSet(BaseAPIViewSet):
    """
    API endpoint for routing problems.
    """

    @extend_schema(
        request=VRPRequestSerializer,
        responses={
            status.HTTP_200_OK: OpenApiResponse(description="VietMap API raw response")
        },
    )
    @action(detail=False, methods=["post"], url_path="vehicle-routing-problem")
    def solve_vrp(self, request):
        """
        Solve vehicle routing problem.
        """

        serializer = VRPRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data
        vehicles = validated_data["vehicles"]
        jobs = validated_data["jobs"]
        mode = validated_data["mode"]

        try:
            vrp_result = RoutingService.solve_vrp(vehicles, jobs, mode)
            return self.response(data=vrp_result, status_code=status.HTTP_200_OK)
        except requests.HTTPError as e:
            return self.response(
                data=e.response.json(), status_code=e.response.status_code
            )
        except requests.RequestException as e:
            return self.response(
                data={"error": str(e)}, status_code=status.HTTP_503_SERVICE_UNAVAILABLE
            )
