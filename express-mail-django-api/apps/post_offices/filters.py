import django_filters
from apps.post_offices.models import PostOffice


class PostOfficeFilter(django_filters.FilterSet):
    """
    FilterSet for PostOffice model, allowing filtering by post office name.
    """

    name = django_filters.CharFilter(lookup_expr="icontains")

    class Meta:
        model = PostOffice
        fields = []
