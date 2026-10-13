from rest_framework import serializers
from .models import RawMaterial


class RawMaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = RawMaterial
        fields = [
            "id",
            "code",
            "name",
            "category",
            "stock_quantity",
            "uom",
            "min_threshold",
            "unit_cost",
            "location",
            "last_updated",
        ]
