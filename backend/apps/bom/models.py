from django.db import models
from apps.products.models import Product


class BillOfMaterials(models.Model):
    product = models.OneToOneField(
        Product,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="bom",
    )
    product_code = models.CharField(max_length=50, unique=True)
    product_name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    version = models.CharField(max_length=20, default="1.0")
    output_uom = models.CharField(max_length=20, default="pcs")
    base_quantity = models.DecimalField(max_digits=10, decimal_places=4, default=1.0)
    estimated_unit_cost = models.DecimalField(
        max_digits=10, decimal_places=2, default=0.0
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f"BOM [{self.product_code}] {self.product_name} (v{self.version})"


class BOMItem(models.Model):
    bom = models.ForeignKey(
        BillOfMaterials, on_delete=models.CASCADE, related_name="items"
    )
    material_id = models.CharField(max_length=50, blank=True)
    material_code = models.CharField(max_length=50)
    material_name = models.CharField(max_length=200)
    quantity_per_unit = models.DecimalField(
        max_digits=12, decimal_places=4, default=1.0
    )
    uom = models.CharField(max_length=20, default="pcs")
    waste_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return f"{self.material_code} -> {self.bom.product_code}"
