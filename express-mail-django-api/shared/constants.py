from shared.enum_choices import EnumChoices


class ExternalModels(EnumChoices):
    ORDER = ("order_external_app", "order")
    PRODUCT = ("product_external_app", "product")
    SHIPPING = ("shipping_external_app", "shipping")


class Groups(EnumChoices):
    ADMIN = "admin"
    POST_OFFICE_MANAGER = "post_office_manager"
    POST_OFFICE_STAFF = "post_office_staff"
    SHOP = "shop"
    SHIPPER = "shipper"


class Roles(EnumChoices):
    SUPER_ADMIN = "superadmin"
    ADMIN = "admin"
    POST_OFFICE_MANAGER = "post_office_manager"
    POST_OFFICE_STAFF = "post_office_staff"
    SHOP = "shop"
    SHIPPER = "shipper"
