export type UnitOfMeasure = 'g' | 'kg' | 'pcs' | 'ml' | 'l' | 'm' | 'sheets' | 'boxes';

export interface RawMaterial {
  id: string;
  code: string; // e.g. "RM-ALUM-01"
  name: string;
  category: 'Metals' | 'Electronics' | 'Plastics' | 'Chemicals' | 'Packaging' | 'Textiles' | 'Other';
  stockQuantity: number;
  uom: UnitOfMeasure;
  minThreshold: number; // Low stock alert threshold
  unitCost: number; // Standard cost per unit in USD/currency
  location: string; // e.g. "Aisle 3 - Bay B"
  lastUpdated: string;
}

export interface ReadyProduct {
  id: string;
  code: string; // Static Product Code e.g. "FG-DRONE-4K"
  name: string;
  description: string;
  stockQuantity: number;
  uom: UnitOfMeasure;
  unitValue: number; // Production sales value / cost
  bomId: string;
  category: string;
  totalProduced: number;
  lastProducedAt?: string;
}

export type WasteStatus = 'LOGGED' | 'RECYCLED' | 'DISPOSED' | 'SALVAGED';

export interface WasteRecord {
  id: string;
  orderNumber: string; // Source production work order e.g. "WO-2026-001"
  productCode: string;
  materialId: string;
  materialCode: string;
  materialName: string;
  wasteQuantity: number;
  uom: UnitOfMeasure;
  wastePercentage: number; // Predefined waste % from BOM
  recordedAt: string;
  reason: string;
  status: WasteStatus;
  dispositionDate?: string;
  dispositionNotes?: string;
}

export type AuditLogType = 
  | 'RESTOCK' 
  | 'PRODUCTION_CONSUMPTION' 
  | 'PRODUCTION_OUTPUT' 
  | 'WASTE_ROUTING' 
  | 'MANUAL_ADJUSTMENT';

export interface AuditLog {
  id: string;
  timestamp: string;
  type: AuditLogType;
  referenceId: string; // Work Order #, PO #, etc.
  itemCode: string;
  itemName: string;
  quantityChange: number; // positive or negative
  uom: UnitOfMeasure;
  balanceAfter?: number;
  actor: string;
  notes: string;
}

export interface BOMMaterialItem {
  id: string;
  materialId: string;
  materialCode: string;
  materialName: string;
  quantityPerUnit: number; // Raw quantity needed per 1 finished item
  uom: UnitOfMeasure;
  wastePercentage: number; // e.g., 2% -> 2
}

export interface BillOfMaterials {
  id: string;
  productCode: string; // Static product code
  productName: string;
  description: string;
  version: string;
  outputUom: UnitOfMeasure;
  baseQuantity: number; // Usually 1
  items: BOMMaterialItem[];
  estimatedUnitCost: number;
  createdAt: string;
  updatedAt: string;
}

export type ProductionOrderStatus = 
  | 'DRAFT' 
  | 'STAGED' 
  | 'IN_PROGRESS' 
  | 'COMPLETED' 
  | 'CANCELLED';

export interface OrderMaterialRequirement {
  materialId: string;
  materialCode: string;
  materialName: string;
  uom: UnitOfMeasure;
  baseRequired: number; // quantityPerUnit * targetQuantity
  wastePercentage: number;
  expectedWasteQuantity: number; // (baseRequired * wastePercentage) / 100
  totalRequired: number; // baseRequired + expectedWasteQuantity
  currentStock: number;
  shortageQuantity: number; // totalRequired - currentStock (0 if sufficient)
  isSufficient: boolean;
}

export interface ProductionOrder {
  id: string;
  orderNumber: string; // e.g. "WO-2026-0042"
  productCode: string;
  productName: string;
  bomId: string;
  targetQuantity: number;
  uom: UnitOfMeasure;
  status: ProductionOrderStatus;
  line: string; // Assembly Line 1, Fab Lab 2, etc.
  operator: string;
  batchNumber: string; // e.g. "BATCH-2026-OCT-88"
  scheduledDate: string;
  startedAt?: string;
  completedAt?: string;
  notes?: string;
  actualProducedQuantity?: number;
  calculatedRequirements?: OrderMaterialRequirement[];
}
