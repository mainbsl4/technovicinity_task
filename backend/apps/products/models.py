from django.db import models


class Product(models.Model):
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100, default="Manufactured Goods")
    stock_quantity = models.DecimalField(max_digits=12, decimal_places=4, default=0.0)
    uom = models.CharField(max_length=20, default="pcs")
    unit_value = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    total_produced = models.DecimalField(max_digits=12, decimal_places=4, default=0.0)
    last_produced_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} [{self.code}]"
