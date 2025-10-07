from rest_framework import routers

from apps.permissions.apis import PermissionViewSet, GroupViewSet
from apps.post_offices.apis import PostOfficeViewSet
from apps.users.apis import UserViewSet, ProfileViewSet

api_router = routers.SimpleRouter()
api_router.register(r"users", UserViewSet, basename="user")
api_router.register(r"permissions", PermissionViewSet, basename="permission")
api_router.register(r"groups", GroupViewSet, basename="group")
api_router.register(r"post-offices", PostOfficeViewSet, basename="office")
api_router.register(r"profiles", ProfileViewSet, basename="profile")


# Add api router urls
urlpatterns = []
urlpatterns += api_router.urls
