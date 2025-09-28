from rest_framework import routers

from apps.users.apis import AdminUserViewSet

api_router = routers.SimpleRouter()
api_router.register(r"users", AdminUserViewSet, basename="admin-user")

# Add api router urls
urlpatterns = []
urlpatterns += api_router.urls
