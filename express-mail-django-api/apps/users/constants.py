from apps.users.models import (
    AdminProfile,
    PostOfficeManagerProfile,
    ShipperProfile,
    PostOfficeStaffProfile,
    ShopProfile,
)
from apps.users.serializers import (
    AdminProfileSerializer,
    PostOfficeManagerProfileSerializer,
    PostOfficeStaffProfileSerializer,
    ShopProfileSerializer,
    ShipperProfileSerializer,
)

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

PROFILE_SERIALIZER_MAP = {
    AdminProfile: AdminProfileSerializer,
    PostOfficeManagerProfile: PostOfficeManagerProfileSerializer,
    PostOfficeStaffProfile: PostOfficeStaffProfileSerializer,
    ShopProfile: ShopProfileSerializer,
    ShipperProfile: ShipperProfileSerializer,
}
