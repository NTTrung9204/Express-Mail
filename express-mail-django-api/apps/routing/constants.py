from shared.enum_choices import EnumChoices


class Vehicles(EnumChoices):
    BIKE = "bike"
    TRUCK = "truck"
    CAR = "car"


class VRPMode(EnumChoices):
    PICKUP = "pickup"
    DELIVERY = "delivery"


VEHICLE_CAPACITY_MAP = {
    Vehicles.BIKE.value: {
        "max_orders": 15,
        "max_volume": 250000,  # cm³
        "max_weight": 30000,  # g
    },
    Vehicles.TRUCK.value: {
        "max_orders": 100,
        "max_volume": 4000000,
        "max_weight": 500000,
    },
}
