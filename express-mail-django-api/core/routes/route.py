from rest_framework import routers as drf_routers
from rest_framework_nested import routers as nested_routers

from apps.permissions.apis import PermissionViewSet, GroupViewSet
from apps.post_offices.apis import (
    PostOfficeViewSet,
    PostOfficeShipperViewSet,
    PostOfficeStaffViewSet,
)
from apps.routing.apis import RoutingViewSet
from apps.shipping.apis import ShippingRateViewSet
from apps.users.apis import UserViewSet, ProfileViewSet, ResetPasswordViewSet

api_router = drf_routers.SimpleRouter(trailing_slash=False)
api_router.register(r"users", UserViewSet, basename="user")
api_router.register(r"permissions", PermissionViewSet, basename="permission")
api_router.register(r"groups", GroupViewSet, basename="group")
api_router.register(r"post-offices", PostOfficeViewSet, basename="office")
api_router.register(r"profiles", ProfileViewSet, basename="profile")
api_router.register(r"reset-password", ResetPasswordViewSet, basename="reset-password")
api_router.register(r"shipping-rates", ShippingRateViewSet, basename="shipping-rate")
api_router.register(r"routes", RoutingViewSet, basename="routes")

nested_shippers_router = nested_routers.NestedSimpleRouter(
    api_router, r"post-offices", lookup="post_office"
)
nested_shippers_router.register(
    r"shippers", PostOfficeShipperViewSet, basename="postoffice-shipper"
)

nested_staffs_router = nested_routers.NestedSimpleRouter(
    api_router, r"post-offices", lookup="post_office"
)
nested_staffs_router.register(
    r"staffs", PostOfficeStaffViewSet, basename="postoffice-staff"
)

# Add api router urls
urlpatterns = []
urlpatterns += api_router.urls
urlpatterns += nested_shippers_router.urls
urlpatterns += nested_staffs_router.urls
