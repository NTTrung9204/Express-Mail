from django.contrib.auth.hashers import make_password

from apps.users.models import User


class UserService:
    """
    Service class for the User model.
    """

    @staticmethod
    def get_base_user_infor(user):
        """
        Get basic user information, return a dictionary containing that data.
        """

        return {
            "id": user.id,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role,
            "email": user.email,
        }

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

    @staticmethod
    def detach_profile(user, related_profile_name):
        """
        Detach a profile out of user.
        """

        related_profile = getattr(user, related_profile_name, None)
        if related_profile:
            User.objects.filter(pk=user.pk).update(role=None)
            related_profile.__class__.objects.filter(pk=related_profile.pk).update(
                user=None
            )

    @staticmethod
    def get_user_by_email(email):
        """
        Get user by email.
        """

        if email is None:
            return None

        try:
            user = User.objects.get(email=email)
            return user
        except User.DoesNotExist:
            return None

    @staticmethod
    def update_password(user, new_password):
        """
        Update user password.
        """

        user.set_password(new_password)
        user.save()

    @staticmethod
    def change_status(user, is_active):
        """
        Change user status(active/inactive).
        """

        user.is_active = is_active
        user.save()
