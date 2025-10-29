from drf_spectacular.utils import extend_schema
from rest_framework.decorators import action

from apps.shipping.models import ShippingRate
from apps.shipping.permissions import CanChangeShippingRateStatus
from apps.shipping.serializers import (
    ShippingRateSerializer,
    CalculateShippingFeeRequestSerializer,
    CalculateShippingFeeResponseSerializer,
)
from services.shippings.shipping_rate_services import ShippingRateService
from shared.apis import BaseAPIViewSet
from rest_framework import mixins

from shared.permissions import FullDjangoModelPermissions
from rest_framework import status


class ShippingRateViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    BaseAPIViewSet,
):
    """
    API endpoint to interact with shipping rates.
    """

    serializer_class = ShippingRateSerializer
    permission_classes = [FullDjangoModelPermissions]
    queryset = ShippingRate.objects.all()

    @action(detail=False, methods=["get"], url_path="active", permission_classes=[])
    def get_current_active_shipping_rate(self, request):
        """
        Get current active shipping rate.
        """

        current_shipping_rate = ShippingRate.get_current_rate()
        if current_shipping_rate:
            return self.response_ok(
                self.get_serializer(instance=current_shipping_rate).data
            )

        return self.response_error(
            "active_shipping_rate_not_set", status_code=status.HTTP_404_NOT_FOUND
        )

    @extend_schema(
        request=None,
        responses={status.HTTP_200_OK: ShippingRateSerializer},
    )
    @action(
        detail=True,
        methods=["patch"],
        url_path="active",
        permission_classes=[CanChangeShippingRateStatus],
    )
    def active_shipping_rate(self, request, pk=None):
        """
        Active shipping rate (deactivate previous shipping rate).
        """

        shipping_rate = self.get_object()
        shipping_rate.activate()

        return self.response_ok(self.get_serializer(instance=shipping_rate).data)

    @extend_schema(
        request=CalculateShippingFeeRequestSerializer,
        responses={status.HTTP_200_OK: CalculateShippingFeeResponseSerializer},
    )
    @action(
        detail=False, methods=["post"], url_path="calculate-fee", permission_classes=[]
    )
    def calculate_shipping_fee(self, request):
        """
        Calculate shipping fee base on current active shipping rate.
        """

        request_serializer = CalculateShippingFeeRequestSerializer(data=request.data)
        request_serializer.is_valid(raise_exception=True)

        validated_data = request_serializer.validated_data
        length = validated_data["length_cm"]
        width = validated_data["width_cm"]
        height = validated_data["height_cm"]
        weight = validated_data["weight_kg"]
        distance = validated_data["distance_km"]

        shipping_rate = ShippingRate.get_current_rate()
        if shipping_rate:
            total_fee = ShippingRateService.calculate_shipping_fee(
                shipping_rate, length, width, height, weight, distance
            )
            data = {
                "shipping_rate_id": shipping_rate.id,
                "total_fee": total_fee,
            }
            return self.response_ok(CalculateShippingFeeResponseSerializer(data).data)

        return self.response_error(
            "active_shipping_rate_not_set", status_code=status.HTTP_404_NOT_FOUND
        )
