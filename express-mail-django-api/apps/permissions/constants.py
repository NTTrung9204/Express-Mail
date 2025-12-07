from shared.enum_choices import EnumChoices


class ExternalModels(EnumChoices):
    ORDER = ("order_external_app", "order")
    PRODUCT = ("product_external_app", "product")
    SHIPPING = ("shipping_external_app", "shipping")
    PLAN = ("plan_external_app", "plan")


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

EXTERNAL_MODEL_PERMISSIONS = {
    ExternalModels.ORDER.name: [
        ("can_create_order", "Can create order"),
        ("can_view_all_orders", "Can view all orders"),
        ("can_view_pickup_orders", "Can view pickup orders"),
        ("can_view_order_by_code", "Can view order by code"),
        ("can_view_shop_orders", "Can view shop orders"),
        ("can_view_shipper_assigned_orders", "Can view shipper assigned orders"),
        ("can_view_orders_by_status", "Can view orders by status"),
        ("can_view_orders_by_shipping_status", "Can view orders by shipping status"),
        ("can_view_order_details", "Can view order details"),
        ("can_update_order", "Can update order"),
        ("can_soft_delete_order", "Can soft delete order"),
        ("can_transition_order", "Can transition order"),
        (
            "can_create_order_post_office_association",
            "Can create order post office association",
        ),
        ("can_view_orders_by_post_office", "Can view orders by post office"),
    ],
    ExternalModels.PRODUCT.name: [],
    ExternalModels.SHIPPING.name: [],
    ExternalModels.PLAN.name: [
        ("can_calculate_optimal_route", "Can calculate optimal route"),
        ("can_view_route_plans", "Can view route plans"),
        ("can_view_vehicle_route_by_id", "Can view vehicle route by id"),
        (
            "can_assign_vehicle_routes_to_shippers",
            "Can assign vehicle routes to shippers",
        ),
        ("can_view_shipping_plan", "Can view shipping plan"),
    ],
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
        "auth.view_group",
        "shipping.add_shippingrate",
        "shipping.view_shippingrate",
        "shipping.change_shippingrate",
        "shipping.change_shippingrate_status",
    ],
    Groups.POST_OFFICE_MANAGER.value: [
        "routing.call_vrp",
        "users.view_shipperprofile",
        "users.view_postofficestaffprofile",
        "post_offices.add_shipper",
        "post_offices.add_staff",
        "post_offices.edit_user",
        "post_offices.delete_user",
        "order_external_app.can_create_order",
        "order_external_app.can_view_all_orders",
        "order_external_app.can_view_pickup_orders",
        "order_external_app.can_view_order_by_code",
        "order_external_app.can_view_shop_orders",
        "order_external_app.can_view_shipper_assigned_orders",
        "order_external_app.can_view_orders_by_status",
        "order_external_app.can_view_orders_by_shipping_status",
        "order_external_app.can_view_order_details",
        "order_external_app.can_update_order",
        "order_external_app.can_soft_delete_order",
        "order_external_app.can_transition_order",
        "order_external_app.can_create_order_post_office_association",
        "order_external_app.can_view_orders_by_post_office",
        "plan_external_app.can_calculate_optimal_route",
        "plan_external_app.can_view_route_plans",
        "plan_external_app.can_view_vehicle_route_by_id",
        "plan_external_app.can_assign_vehicle_routes_to_shippers",
        "plan_external_app.can_view_shipping_plan",
    ],
    Groups.POST_OFFICE_STAFF.value: [
        "routing.call_vrp",
        "order_external_app.can_create_order",
        "order_external_app.can_view_all_orders",
        "order_external_app.can_view_pickup_orders",
        "order_external_app.can_view_order_by_code",
        "order_external_app.can_view_shop_orders",
        "order_external_app.can_view_shipper_assigned_orders",
        "order_external_app.can_view_orders_by_status",
        "order_external_app.can_view_orders_by_shipping_status",
        "order_external_app.can_view_order_details",
        "order_external_app.can_update_order",
        "order_external_app.can_soft_delete_order",
        "order_external_app.can_transition_order",
        "order_external_app.can_create_order_post_office_association",
        "order_external_app.can_view_orders_by_post_office",
        "plan_external_app.can_calculate_optimal_route",
        "plan_external_app.can_view_route_plans",
        "plan_external_app.can_view_vehicle_route_by_id",
        "plan_external_app.can_assign_vehicle_routes_to_shippers",
        "plan_external_app.can_view_shipping_plan",
    ],
    Groups.SHOP.value: [
        "order_external_app.can_create_order",
        "order_external_app.can_view_all_orders",
        "order_external_app.can_view_pickup_orders",
        "order_external_app.can_view_order_by_code",
        "order_external_app.can_view_order_details",
        "order_external_app.can_update_order",
        "order_external_app.can_soft_delete_order",
    ],
    Groups.SHIPPER.value: [
        "order_external_app.can_view_pickup_orders",
        "order_external_app.can_view_order_by_code",
        "order_external_app.can_view_shop_orders",
        "order_external_app.can_view_shipper_assigned_orders",
        "order_external_app.can_view_orders_by_status",
        "order_external_app.can_view_order_details",
        "order_external_app.can_update_order",
    ],
}
