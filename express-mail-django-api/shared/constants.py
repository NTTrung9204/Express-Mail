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
        "post_offices.add_postoffice",
        "post_offices.change_postoffice",
        "post_offices.delete_postoffice",
        "post_offices.view_postoffice",
        "users.add_user",
        "users.change_user",
        "users.delete_user",
        "users.view_user",
        "users.add_adminprofile",
        "users.change_adminprofile",
        "users.delete_adminprofile",
        "users.view_adminprofile",
        "users.add_postofficemanagerprofile",
        "users.change_postofficemanagerprofile",
        "users.delete_postofficemanagerprofile",
        "users.view_postofficemanagerprofile",
        "users.add_postofficestaffprofile",
        "users.change_postofficestaffprofile",
        "users.delete_postofficestaffprofile",
        "users.view_postofficestaffprofile",
        "users.add_shipperprofile",
        "users.change_shipperprofile",
        "users.delete_shipperprofile",
        "users.view_shipperprofile",
        "users.add_shopprofile",
        "users.change_shopprofile",
        "users.delete_shopprofile",
        "users.view_shopprofile",
    ],
    Groups.POST_OFFICE_MANAGER.value: [],
    Groups.POST_OFFICE_STAFF.value: [],
    Groups.SHOP.value: [],
    Groups.SHIPPER.value: [],
}

PROFILE_VIEWSET_ACTION_PERMISSIONS = {
    "update_create_admin_profile": [
        "users.change_adminprofile",
        "users.add_adminprofile",
    ],
    "update_create_post_office_manager_profile": [
        "users.add_postofficemanagerprofile",
        "users.change_postofficemanagerprofile",
    ],
    "update_create_post_office_staff_profile": [
        "users.add_postofficestaffprofile",
        "users.change_postofficestaffprofile",
    ],
    "update_create_shop_profile": [
        "users.add_shopprofile",
        "users.change_shopprofile",
    ],
    "update_create_shipper_profile": [
        "users.add_shipperprofile",
        "users.change_shipperprofile",
    ],
}
