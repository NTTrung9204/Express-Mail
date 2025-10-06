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


ROLE_GROUP_MAP = {
    Roles.ADMIN.value: [Groups.ADMIN.value],
    Roles.POST_OFFICE_MANAGER.value: [Groups.POST_OFFICE_MANAGER.value],
    Roles.POST_OFFICE_STAFF.value: [Groups.POST_OFFICE_STAFF.value],
    Roles.SHOP.value: [Groups.SHOP.value],
    Roles.SHIPPER.value: [Groups.SHIPPER.value],
}

GROUP_PERMISSIONS_MAP = {
    Groups.ADMIN.value: [
        "add_postoffice",
        "change_postoffice",
        "delete_postoffice",
        "view_postoffice",
        "add_user",
        "change_user",
        "delete_user",
        "view_user",
        "add_adminprofile",
        "change_adminprofile",
        "delete_adminprofile",
        "view_adminprofile",
        "add_postofficemanagerprofile",
        "change_postofficemanagerprofile",
        "delete_postofficemanagerprofile",
        "view_postofficemanagerprofile",
        "add_postofficestaffprofile",
        "change_postofficestaffprofile",
        "delete_postofficestaffprofile",
        "view_postofficestaffprofile",
        "add_shipperprofile",
        "change_shipperprofile",
        "delete_shipperprofile",
        "view_shipperprofile",
        "add_shopprofile",
        "change_shopprofile",
        "delete_shopprofile",
        "view_shopprofile",
    ],
    Groups.POST_OFFICE_MANAGER.value: [],
    Groups.POST_OFFICE_STAFF.value: [],
    Groups.SHOP.value: [],
    Groups.SHIPPER.value: [],
}
