class ShippingRateService:
    """
    Service class for ShippingRate model.
    """

    @staticmethod
    def calculate_shipping_fee(shipping_rate, length, width, height, weight, distance):
        """
        Calculate shipping fee based on shipping rate object and input information.
        """

        total_fee = (
            shipping_rate.base_fee
            + distance * shipping_rate.rate_per_km
            + max(
                weight * shipping_rate.rate_per_kg,
                (length * width * height) / shipping_rate.volumetric_divisor,
            )
        )
        return total_fee
