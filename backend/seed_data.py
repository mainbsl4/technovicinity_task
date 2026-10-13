import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'projects.settings')
django.setup()

from apps.raw_materials.models import RawMaterial
from apps.products.models import Product
from apps.bom.models import BillOfMaterials, BOMItem

print("Seeding initial data into SQLite...")

# 1. Raw Materials
raw_materials_data = [
    {
        "code": "RM-ALU-6061",
        "name": "Aerospace Grade Aluminum Bar (6061)",
        "category": "Metals",
        "stock_quantity": 420.5,
        "uom": "kg",
        "min_threshold": 100.0,
        "unit_cost": 8.50,
        "location": "Warehouse Zone A-12",
    },
    {
        "code": "RM-MCU-CORTEX",
        "name": "STM32 ARM Cortex-M4 Microcontroller",
        "category": "Electronics",
        "stock_quantity": 1850.0,
        "uom": "pcs",
        "min_threshold": 300.0,
        "unit_cost": 12.20,
        "location": "Cleanroom Cabinet C-04",
    },
    {
        "code": "RM-BAT-21700",
        "name": "Lithium-Ion Cell (21700 High Drain)",
        "category": "Electronics",
        "stock_quantity": 2400.0,
        "uom": "pcs",
        "min_threshold": 500.0,
        "unit_cost": 4.80,
        "location": "Hazmat Battery Vault B-01",
    },
    {
        "code": "RM-POLY-ABS",
        "name": "High-Impact ABS Polymer Pellets",
        "category": "Plastics",
        "stock_quantity": 1250.0,
        "uom": "kg",
        "min_threshold": 250.0,
        "unit_cost": 3.40,
        "location": "Silo Tank S-02",
    },
    {
        "code": "RM-SEN-ENV01",
        "name": "BME688 Digital Gas & Climate Sensor",
        "category": "Electronics",
        "stock_quantity": 920.0,
        "uom": "pcs",
        "min_threshold": 200.0,
        "unit_cost": 15.50,
        "location": "Cleanroom Cabinet C-07",
    },
    {
        "code": "RM-WR-HARNESS",
        "name": "High-Flex Silicone Wire Harness",
        "category": "Electronics",
        "stock_quantity": 3400.0,
        "uom": "m",
        "min_threshold": 500.0,
        "unit_cost": 1.15,
        "location": "Spool Rack R-09",
    },
    {
        "code": "RM-SCRW-M3",
        "name": "Titanium Torx Fasteners (M3x8mm)",
        "category": "Metals",
        "stock_quantity": 15000.0,
        "uom": "pcs",
        "min_threshold": 2000.0,
        "unit_cost": 0.22,
        "location": "Hardware Bins H-14",
    },
    {
        "code": "RM-GLS-OLED",
        "name": "Capacitive Gorilla Glass OLED Display Module",
        "category": "Electronics",
        "stock_quantity": 340.0,
        "uom": "pcs",
        "min_threshold": 100.0,
        "unit_cost": 28.00,
        "location": "Optical Bay Opt-03",
    },
]

for item in raw_materials_data:
    RawMaterial.objects.update_or_create(code=item["code"], defaults=item)
print(f"Seeded {len(raw_materials_data)} Raw Materials.")

# 2. Products
products_data = [
    {
        "code": "FG-SMART-THERM-X",
        "name": "Apex Touch Smart Thermostat",
        "description": "Precision IoT home climate control unit with ambient sensor array and tempered touchscreen glass.",
        "category": "Smart Home Devices",
        "stock_quantity": 185.0,
        "uom": "pcs",
        "unit_value": 129.99,
        "total_produced": 540.0,
    },
    {
        "code": "FG-IND-DRONE-4K",
        "name": "Titan Industrial Survey Drone",
        "description": "Rugged autonomous inspection drone equipped with dual battery hot-swap bay and CNC milled alloy unibody.",
        "category": "Industrial Robotics",
        "stock_quantity": 42.0,
        "uom": "pcs",
        "unit_value": 899.00,
        "total_produced": 120.0,
    },
    {
        "code": "FG-ROBOT-ARM",
        "name": "High-Torque Robotic Arm Actuator",
        "description": "High-precision industrial articulated robotic arm module with harmonic gearbox and brushless servo.",
        "category": "Industrial Robotics",
        "stock_quantity": 0.0,
        "uom": "pcs",
        "unit_value": 349.00,
        "total_produced": 0.0,
    },
    {
        "code": "FG-SOLAR-INV",
        "name": "Solar Grid Inverter Controller 5kW",
        "description": "Pure sine wave solar inverter controller unit with dual MPPT tracking and thermal heatsink.",
        "category": "Power Electronics",
        "stock_quantity": 0.0,
        "uom": "pcs",
        "unit_value": 420.00,
        "total_produced": 0.0,
    },
    {
        "code": "FG-IOT-GATEWAY",
        "name": "Rugged Industrial IoT Edge Gateway",
        "description": "Multi-protocol telemetry gateway with isolated RS-485, CAN bus transceiver and aluminum enclosure.",
        "category": "Electronics",
        "stock_quantity": 0.0,
        "uom": "pcs",
        "unit_value": 215.00,
        "total_produced": 0.0,
    },
    {
        "code": "FG-MED-PUMP",
        "name": "Precision Micro-Infusion Pump Module",
        "description": "Medical-grade stepper linear actuator infusion pump with optical rotary encoder feedback.",
        "category": "Medical Devices",
        "stock_quantity": 0.0,
        "uom": "pcs",
        "unit_value": 580.00,
        "total_produced": 0.0,
    },
]

for p_data in products_data:
    Product.objects.update_or_create(code=p_data["code"], defaults=p_data)
print(f"Seeded {len(products_data)} Products.")

# 3. Bill of Materials
boms_data = [
    {
        "product_code": "FG-SMART-THERM-X",
        "product_name": "Apex Touch Smart Thermostat",
        "description": "Smart IoT thermostat recipe utilizing optical OLED glass, ABS polymer injection shell, ARM MCU and thermal sensor array.",
        "version": "2.1",
        "output_uom": "pcs",
        "base_quantity": 1.0,
        "estimated_unit_cost": 49.32,
        "items": [
            {
                "material_code": "RM-GLS-OLED",
                "material_name": "Capacitive Gorilla Glass OLED Display Module",
                "quantity_per_unit": 1.0,
                "uom": "pcs",
                "waste_percentage": 1.5,
            },
            {
                "material_code": "RM-MCU-CORTEX",
                "material_name": "STM32 ARM Cortex-M4 Microcontroller",
                "quantity_per_unit": 1.0,
                "uom": "pcs",
                "waste_percentage": 0.5,
            },
            {
                "material_code": "RM-SEN-ENV01",
                "material_name": "BME688 Digital Gas & Climate Sensor",
                "quantity_per_unit": 1.0,
                "uom": "pcs",
                "waste_percentage": 1.0,
            },
            {
                "material_code": "RM-POLY-ABS",
                "material_name": "High-Impact ABS Polymer Pellets",
                "quantity_per_unit": 0.22,
                "uom": "kg",
                "waste_percentage": 3.0,
            },
            {
                "material_code": "RM-SCRW-M3",
                "material_name": "Titanium Torx Fasteners (M3x8mm)",
                "quantity_per_unit": 4.0,
                "uom": "pcs",
                "waste_percentage": 2.0,
            },
        ],
    },
    {
        "product_code": "FG-IND-DRONE-4K",
        "product_name": "Titan Industrial Survey Drone",
        "description": "Rugged autonomous inspection drone equipped with dual battery hot-swap bay and CNC milled alloy unibody.",
        "version": "1.4",
        "output_uom": "pcs",
        "base_quantity": 1.0,
        "estimated_unit_cost": 142.20,
        "items": [
            {
                "material_code": "RM-ALU-6061",
                "material_name": "Aerospace Grade Aluminum Bar (6061)",
                "quantity_per_unit": 1.85,
                "uom": "kg",
                "waste_percentage": 4.5,
            },
            {
                "material_code": "RM-MCU-CORTEX",
                "material_name": "STM32 ARM Cortex-M4 Microcontroller",
                "quantity_per_unit": 2.0,
                "uom": "pcs",
                "waste_percentage": 1.0,
            },
            {
                "material_code": "RM-BAT-21700",
                "material_name": "Lithium-Ion Cell (21700 High Drain)",
                "quantity_per_unit": 6.0,
                "uom": "pcs",
                "waste_percentage": 1.5,
            },
            {
                "material_code": "RM-WR-HARNESS",
                "material_name": "High-Flex Silicone Wire Harness",
                "quantity_per_unit": 3.2,
                "uom": "m",
                "waste_percentage": 3.0,
            },
            {
                "material_code": "RM-SCRW-M3",
                "material_name": "Titanium Torx Fasteners (M3x8mm)",
                "quantity_per_unit": 16.0,
                "uom": "pcs",
                "waste_percentage": 3.0,
            },
        ],
    },
]

for b_data in boms_data:
    items = b_data.pop("items")
    product = Product.objects.filter(code__iexact=b_data["product_code"]).first()
    bom, _ = BillOfMaterials.objects.update_or_create(
        product_code=b_data["product_code"],
        defaults={**b_data, "product": product}
    )
    bom.items.all().delete()
    for it in items:
        mat = RawMaterial.objects.filter(code__iexact=it.get("material_code", "")).first()
        if mat:
            it["material_id"] = f"rm-{mat.id}"
        BOMItem.objects.create(bom=bom, **it)

print(f"Seeded {len(boms_data)} Bill of Materials.")
print("All initial seed data successfully loaded into database!")
