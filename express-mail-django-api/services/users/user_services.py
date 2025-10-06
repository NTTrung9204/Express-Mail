from django.contrib.auth.hashers import make_password

from apps.users.models import User


class UserService:
    """
    Service class for the User model.
    """

    @staticmethod
    def create(user_validated_data):
        """
        Create a new User instance with validated data.
        """

        password = user_validated_data.pop("password", None)
        return User.objects.create(
            **user_validated_data, password=make_password(password)
        )

    @staticmethod
    def update(user, user_validated_data):
        """
        Update an existing User instance.
        """

        password = user_validated_data.pop("password", None)

        for attr, value in user_validated_data.items():
            setattr(user, attr, value)

        if password is not None:
            user.set_password(password)

        user.save()

        return user
