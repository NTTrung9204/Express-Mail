from rest_framework import routers

from apps.permissions.views import AdminPermissionViewSet, AdminGroupViewSet
from apps.users.apis import AdminUserViewSet

api_router = routers.SimpleRouter()
api_router.register(r"users", AdminUserViewSet, basename="admin-user")
api_router.register(r"permissions", AdminPermissionViewSet, basename="admin-permission")
api_router.register(r"groups", AdminGroupViewSet, basename="admin-group")

# Add api router urls
urlpatterns = []
urlpatterns += api_router.urls
