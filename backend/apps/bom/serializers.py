from rest_framework import serializers
from .models import BillOfMaterials, BOMItem
from apps.products.models import Product


class BOMItemSerializer(serializers.ModelSerializer):
    materialId = serializers.CharField(
        source="material_id", required=False, allow_blank=True
    )
    materialCode = serializers.CharField(source="material_code")
    materialName = serializers.CharField(source="material_name")
    quantityPerUnit = serializers.FloatField(source="quantity_per_unit")
    wastePercentage = serializers.FloatField(
        source="waste_percentage", required=False, default=0.0
    )

    class Meta:
        model = BOMItem
        fields = [
            "id",
            "materialId",
            "materialCode",
            "materialName",
            "quantityPerUnit",
            "uom",
            "wastePercentage",
        ]


class BillOfMaterialsSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()
    productCode = serializers.CharField(source="product_code")
    productName = serializers.CharField(source="product_name")
    outputUom = serializers.CharField(
        source="output_uom", required=False, default="pcs"
    )
    baseQuantity = serializers.FloatField(
        source="base_quantity", required=False, default=1.0
    )
    estimatedUnitCost = serializers.FloatField(
        source="estimated_unit_cost", required=False, default=0.0
    )
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)
    items = BOMItemSerializer(many=True, required=False)

    class Meta:
        model = BillOfMaterials
        fields = [
            "id",
            "productCode",
            "productName",
            "description",
            "version",
            "outputUom",
            "baseQuantity",
            "estimatedUnitCost",
            "items",
            "createdAt",
            "updatedAt",
        ]

    def get_id(self, obj):
        return f"bom-{obj.id}"

    def create(self, validated_data):
        items_data = validated_data.pop("items", [])
        product_code = validated_data.get("product_code", "").strip().upper()

        # Link matching product in catalog
        product = Product.objects.filter(code__iexact=product_code).first()
        if product:
            validated_data["product"] = product

        bom = BillOfMaterials.objects.create(**validated_data)
        for item_data in items_data:
            BOMItem.objects.create(bom=bom, **item_data)
        return bom

    def update(self, instance, validated_data):
        items_data = validated_data.pop("items", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # Update product link
        product_code = instance.product_code.strip().upper()
        product = Product.objects.filter(code__iexact=product_code).first()
        if product:
            instance.product = product

        instance.save()

        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                BOMItem.objects.create(bom=instance, **item_data)

        return instance
