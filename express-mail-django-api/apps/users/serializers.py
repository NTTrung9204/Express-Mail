from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from apps.users.models import User
from shared.messages import ERROR_MESSAGES


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the User model.
    """

    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(
        validators=[
            UniqueValidator(
                queryset=User.all_objects.all(),
                message=ERROR_MESSAGES["email_already_exists"],
            )
        ]
    )

    class Meta:
        """
        Meta class for UserSerializer.
        """

        model = User
        fields = ["id", "username", "password", "email", "first_name", "last_name"]
