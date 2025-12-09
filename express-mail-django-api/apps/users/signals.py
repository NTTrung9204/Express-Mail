from django.db.models.signals import m2m_changed
from django.dispatch import receiver
from apps.users.models import User
from services.jwt_auth.jwt_auth_services import JWTAuthService


@receiver(m2m_changed, sender=User.exclude_permissions.through)
def invalidate_jwt_on_permission_change(sender, instance, action, **kwargs):
    """
    Invalid user JWT if exclude permission is changed.
    """

    if action in ["post_add", "post_remove", "post_clear"]:
        JWTAuthService.delete_all_access_token(instance)
        JWTAuthService.black_list_all_refresh_token(instance)
