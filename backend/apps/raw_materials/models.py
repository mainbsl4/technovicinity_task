from django.db import models


class RawMaterial(models.Model):
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=100, default="Other")
    stock_quantity = models.DecimalField(max_digits=12, decimal_places=4, default=0.0)
    uom = models.CharField(max_length=20, default="pcs")
    min_threshold = models.DecimalField(max_digits=12, decimal_places=4, default=10.0)
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    location = models.CharField(max_length=100, blank=True)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["code"]

    def __str__(self):
        return f"[{self.code}] {self.name}"
