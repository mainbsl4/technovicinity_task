from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns
from . import views

urlpatterns = [
    path("raw-materials/", views.RawMaterialList.as_view(), name="raw-material-list"),
    path(
        "raw-materials/<int:pk>/",
        views.RawMaterialDetail.as_view(),
        name="raw-material-detail",
    ),
]

urlpatterns = format_suffix_patterns(urlpatterns)
