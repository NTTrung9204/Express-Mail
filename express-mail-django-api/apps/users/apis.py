from drf_spectacular.utils import extend_schema
from rest_framework.permissions import DjangoModelPermissions
from rest_framework.viewsets import ModelViewSet

from apps.users.models import User
from apps.users.serializers import UserSerializer
from services.users.user_services import UserService
from shared.apis import BaseAPIViewSet


@extend_schema(tags=["Admin > Users"])
class AdminUserViewSet(ModelViewSet, BaseAPIViewSet):
    """
    API endpoint to interact with the User model, use in admin site.
    """

    serializer_class = UserSerializer
    permission_classes = [DjangoModelPermissions]
    queryset = User.objects.all()

    def perform_create(self, serializer):
        """
        Create a new User instance with hashed password.
        """

        new_user = UserService.create(serializer.validated_data)
        serializer.instance = new_user

    def perform_update(self, serializer):
        """
        Update an existing User instance.
        """

        user = UserService.update(self.get_object(), serializer.validated_data)
        serializer.instance = user
