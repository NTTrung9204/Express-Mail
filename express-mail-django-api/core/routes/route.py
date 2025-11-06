from rest_framework import routers

from apps.permissions.apis import PermissionViewSet, GroupViewSet
from apps.post_offices.apis import PostOfficeViewSet
from apps.routing.apis import RoutingViewSet
from apps.shipping.apis import ShippingRateViewSet
from apps.users.apis import UserViewSet, ProfileViewSet, ResetPasswordViewSet

api_router = routers.SimpleRouter(trailing_slash=False)
api_router.register(r"users", UserViewSet, basename="user")
api_router.register(r"permissions", PermissionViewSet, basename="permission")
api_router.register(r"groups", GroupViewSet, basename="group")
api_router.register(r"post-offices", PostOfficeViewSet, basename="office")
api_router.register(r"profiles", ProfileViewSet, basename="profile")
api_router.register(r"reset-password", ResetPasswordViewSet, basename="reset-password")
api_router.register(r"shipping-rates", ShippingRateViewSet, basename="shipping-rate")
api_router.register(r"routes", RoutingViewSet, basename="routes")

# Add api router urls
urlpatterns = []
urlpatterns += api_router.urls
