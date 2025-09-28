from shared.enum_choices import EnumChoices


class ExternalModels(EnumChoices):
    ORDER = ("external_app", "order")
    PRODUCT = ("external_app", "product")
    SHIPPING = ("external_app", "shipping")


class Groups(EnumChoices):
    ADMIN = "admin"
    POST_OFFICE_MANAGER = "post_office_manager"
    POST_OFFICE_STAFF = "post_office_staff"
    SHOP = "shop"
    SHIPPER = "shipper"
