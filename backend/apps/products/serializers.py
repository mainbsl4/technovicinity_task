from rest_framework import serializers
from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    bom_id = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "code",
            "name",
            "description",
            "category",
            "stock_quantity",
            "uom",
            "unit_value",
            "total_produced",
            "last_produced_at",
            "bom_id",
            "created_at",
            "updated_at",
        ]

    def get_bom_id(self, obj):
        if hasattr(obj, "bom") and obj.bom:
            return obj.bom.id
        return None
