from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns
from . import views

urlpatterns = [
    path("boms/", views.BOMList.as_view(), name="bom-list"),
    path("boms/<str:pk>/", views.BOMDetail.as_view(), name="bom-detail"),
]

urlpatterns = format_suffix_patterns(urlpatterns)
