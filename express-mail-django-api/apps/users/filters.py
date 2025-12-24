import django_filters
from django.db.models import Q
from apps.users.models import User


class UserFilter(django_filters.FilterSet):
    """
    FilterSet for User model, allowing filtering by username OR email.
    """

    search = django_filters.CharFilter(
        method="filter_by_username_or_email", label="Username or Email"
    )

    class Meta:
        model = User
        fields = []

    def filter_by_username_or_email(self, queryset, name, value):
        """
        Filter by username or email.
        """

        return queryset.filter(Q(username__icontains=value) | Q(email__icontains=value))
