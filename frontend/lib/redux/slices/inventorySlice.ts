import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RawMaterial, ReadyProduct, WasteRecord, AuditLog, WasteStatus, UnitOfMeasure } from '../../types';
interface InventoryState {
  rawMaterials: RawMaterial[];
  readyProducts: ReadyProduct[];
  wasteRecords: WasteRecord[];
  auditLogs: AuditLog[];
}

const initialState: InventoryState = {
  rawMaterials: [],
  readyProducts: [],
  wasteRecords: [],
  auditLogs: [],
};

export const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    // Restock an existing raw material
    restockRawMaterial: (
      state,
      action: PayloadAction<{ materialId: string; quantity: number; notes?: string; actor?: string }>
    ) => {
      const { materialId, quantity, notes, actor } = action.payload;
      const material = state.rawMaterials.find(
        (m) => m.id === materialId || (materialId && m.code.toUpperCase() === materialId.toUpperCase())
      );
      if (material && quantity > 0) {
        material.stockQuantity = Number((material.stockQuantity + quantity).toFixed(4));
        material.lastUpdated = new Date().toISOString();

        state.auditLogs.unshift({
          id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: new Date().toISOString(),
          type: 'RESTOCK',
          referenceId: `RESTOCK-${material.code}`,
          itemCode: material.code,
          itemName: material.name,
          quantityChange: quantity,
          uom: material.uom,
          balanceAfter: material.stockQuantity,
          actor: actor || 'Inventory Manager',
          notes: notes || `Restocked ${quantity} ${material.uom} into ${material.location}`,
        });
      }
    },

    // Add a new raw material item to catalog
    addNewRawMaterial: (state, action: PayloadAction<Omit<RawMaterial, 'id' | 'lastUpdated'>>) => {
      const newMaterial: RawMaterial = {
        ...action.payload,
        id: `rm-${Date.now()}`,
        lastUpdated: new Date().toISOString(),
      };
      state.rawMaterials.push(newMaterial);

      state.auditLogs.unshift({
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'MANUAL_ADJUSTMENT',
        referenceId: 'NEW_CATALOG_ITEM',
        itemCode: newMaterial.code,
        itemName: newMaterial.name,
        quantityChange: newMaterial.stockQuantity,
        uom: newMaterial.uom,
        balanceAfter: newMaterial.stockQuantity,
        actor: 'Catalog Administrator',
        notes: `Cataloged new raw material with initial stock of ${newMaterial.stockQuantity} ${newMaterial.uom}`,
      });
    },

    // Add or update a Ready Product (Finished Good)
    addNewReadyProduct: (state, action: PayloadAction<Omit<ReadyProduct, 'id' | 'totalProduced'>>) => {
      const newProduct: ReadyProduct = {
        ...action.payload,
        id: `rp-${Date.now()}`,
        totalProduced: action.payload.stockQuantity,
      };
      state.readyProducts.push(newProduct);
    },

    // Link a BOM recipe ID to a Ready Product
    setProductBOMId: (
      state,
      action: PayloadAction<{ productCode: string; bomId: string }>
    ) => {
      const product = state.readyProducts.find((p) => p.code === action.payload.productCode);
      if (product) {
        product.bomId = action.payload.bomId;
      }
    },

    // Unlink BOM if a BOM recipe is deleted
    unlinkProductBOM: (state, action: PayloadAction<string>) => {
      const product = state.readyProducts.find((p) => p.bomId === action.payload);
      if (product) {
        product.bomId = '';
      }
    },

    // AUTOMATED LIFECYCLE ROUTING REDUCER
    // Executed when a production order is confirmed and completed
    executeProductionLifecycleRouting: (
      state,
      action: PayloadAction<{
        orderNumber: string;
        productCode: string;
        productName: string;
        completedQuantity: number;
        outputUom: RawMaterial['uom'];
        materialsConsumed: {
          materialId: string;
          materialCode: string;
          materialName: string;
          baseRequired: number;
          wasteExpected: number;
          totalDeducted: number;
          wastePercentage: number;
          uom: RawMaterial['uom'];
        }[];
        operator: string;
        skipMaterialDeduction?: boolean;
      }>
    ) => {
      const {
        orderNumber,
        productCode,
        productName,
        completedQuantity,
        outputUom,
        materialsConsumed,
        operator,
      } = action.payload;

      const now = new Date().toISOString();

      // 1. Credit Ready Product (Finished Good)
      let product = state.readyProducts.find((p) => p.code === productCode);
      if (product) {
        product.stockQuantity = Number((product.stockQuantity + completedQuantity).toFixed(4));
        product.totalProduced = Number((product.totalProduced + completedQuantity).toFixed(4));
        product.lastProducedAt = now;
      } else {
        // Auto-register if doesn't exist
        state.readyProducts.push({
          id: `rp-${Date.now()}`,
          code: productCode,
          name: productName,
          description: `Finished product manufactured under ${orderNumber}`,
          stockQuantity: completedQuantity,
          uom: outputUom,
          unitValue: 100.0,
          bomId: '',
          category: 'Manufactured Goods',
          totalProduced: completedQuantity,
          lastProducedAt: now,
        });
      }

      // Log Ready Product routing audit
      state.auditLogs.unshift({
        id: `aud-${Date.now()}-out`,
        timestamp: now,
        type: 'PRODUCTION_OUTPUT',
        referenceId: orderNumber,
        itemCode: productCode,
        itemName: productName,
        quantityChange: completedQuantity,
        uom: outputUom,
        balanceAfter: product ? product.stockQuantity : completedQuantity,
        actor: operator,
        notes: `Production completed: Routed ${completedQuantity} ${outputUom} to Ready Product inventory.`,
      });

      // 2. Deduct Raw Materials and 3. Forward Waste to Waste Inventory (unless already deducted at order launch)
      if (!action.payload.skipMaterialDeduction) {
        materialsConsumed.forEach((mat) => {
          const rawMat = state.rawMaterials.find(
            (m) =>
              (mat.materialId && m.id === mat.materialId) ||
              (mat.materialCode && m.code.toUpperCase() === mat.materialCode.toUpperCase())
          );
          if (rawMat) {
            // Deduct from stock (Base + Waste allowance)
            rawMat.stockQuantity = Number(Math.max(0, rawMat.stockQuantity - mat.totalDeducted).toFixed(4));
            rawMat.lastUpdated = now;

            // Audit log for consumption
            state.auditLogs.unshift({
              id: `aud-${Date.now()}-con-${mat.materialCode}`,
              timestamp: now,
              type: 'PRODUCTION_CONSUMPTION',
              referenceId: orderNumber,
              itemCode: mat.materialCode,
              itemName: mat.materialName,
              quantityChange: -mat.totalDeducted,
              uom: mat.uom,
              balanceAfter: rawMat.stockQuantity,
              actor: 'Lifecycle Auto-Router',
              notes: `Consumed for order ${orderNumber} (${mat.baseRequired} ${mat.uom} net + ${mat.wasteExpected} ${mat.uom} ${mat.wastePercentage}% waste).`,
            });
          }

          // Forward calculated waste to Waste Inventory if waste quantity > 0
          if (mat.wasteExpected > 0) {
            const wasteRecord: WasteRecord = {
              id: `wst-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              orderNumber,
              productCode,
              materialId: mat.materialId,
              materialCode: mat.materialCode,
              materialName: mat.materialName,
              wasteQuantity: Number(mat.wasteExpected.toFixed(4)),
              uom: mat.uom,
              wastePercentage: mat.wastePercentage,
              recordedAt: now,
              reason: `Standard BOM process waste (${mat.wastePercentage}%) generated during production run.`,
              status: 'LOGGED',
            };
            state.wasteRecords.unshift(wasteRecord);

            // Audit log for waste routing
            state.auditLogs.unshift({
              id: `aud-${Date.now()}-wst-${mat.materialCode}`,
              timestamp: now,
              type: 'WASTE_ROUTING',
              referenceId: orderNumber,
              itemCode: mat.materialCode,
              itemName: mat.materialName,
              quantityChange: Number(mat.wasteExpected.toFixed(4)),
              uom: mat.uom,
              actor: 'Lifecycle Auto-Router',
              notes: `Material loss routing: Forwarded ${mat.wasteExpected} ${mat.uom} to Waste Management inventory.`,
            });
          }
        });
      }
    },

    // Deduct raw materials and forward waste when an order is started/run
    consumeRawMaterialsForOrder: (
      state,
      action: PayloadAction<{
        orderNumber: string;
        productCode: string;
        materialsConsumed: {
          materialId: string;
          materialCode: string;
          materialName: string;
          baseRequired: number;
          wasteExpected: number;
          totalDeducted: number;
          wastePercentage: number;
          uom: UnitOfMeasure;
        }[];
        operator: string;
      }>
    ) => {
      const { orderNumber, productCode, materialsConsumed, operator } = action.payload;
      const now = new Date().toISOString();

      materialsConsumed.forEach((mat) => {
        const rawMat = state.rawMaterials.find(
          (m) =>
            (mat.materialId && m.id === mat.materialId) ||
            (mat.materialCode && m.code.toUpperCase() === mat.materialCode.toUpperCase())
        );
        if (rawMat) {
          rawMat.stockQuantity = Number(Math.max(0, rawMat.stockQuantity - mat.totalDeducted).toFixed(4));
          rawMat.lastUpdated = now;

          state.auditLogs.unshift({
            id: `aud-${Date.now()}-con-${mat.materialCode}`,
            timestamp: now,
            type: 'PRODUCTION_CONSUMPTION',
            referenceId: orderNumber,
            itemCode: mat.materialCode,
            itemName: mat.materialName,
            quantityChange: -mat.totalDeducted,
            uom: mat.uom,
            balanceAfter: rawMat.stockQuantity,
            actor: operator || 'Production Operator',
            notes: `Consumed for order ${orderNumber} (${mat.baseRequired} ${mat.uom} net + ${mat.wasteExpected} ${mat.uom} ${mat.wastePercentage}% waste).`,
          });
        }

        if (mat.wasteExpected > 0) {
          state.wasteRecords.unshift({
            id: `wst-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            orderNumber,
            productCode,
            materialId: mat.materialId,
            materialCode: mat.materialCode,
            materialName: mat.materialName,
            wasteQuantity: Number(mat.wasteExpected.toFixed(4)),
            uom: mat.uom,
            wastePercentage: mat.wastePercentage,
            recordedAt: now,
            reason: `Standard BOM process waste (${mat.wastePercentage}%) generated during production run.`,
            status: 'LOGGED',
          });

          state.auditLogs.unshift({
            id: `aud-${Date.now()}-wst-${mat.materialCode}`,
            timestamp: now,
            type: 'WASTE_ROUTING',
            referenceId: orderNumber,
            itemCode: mat.materialCode,
            itemName: mat.materialName,
            quantityChange: Number(mat.wasteExpected.toFixed(4)),
            uom: mat.uom,
            actor: 'Lifecycle Auto-Router',
            notes: `Material loss routing: Forwarded ${mat.wasteExpected} ${mat.uom} to Waste Management inventory.`,
          });
        }
      });
    },

    // Update waste disposition status (e.g. Recycled, Disposed, Salvaged)
    updateWasteStatus: (
      state,
      action: PayloadAction<{ wasteId: string; status: WasteStatus; notes?: string }>
    ) => {
      const record = state.wasteRecords.find((w) => w.id === action.payload.wasteId);
      if (record) {
        record.status = action.payload.status;
        record.dispositionDate = new Date().toISOString();
        if (action.payload.notes) {
          record.dispositionNotes = action.payload.notes;
        }
      }
    },

    // Reset inventory state
    resetInventoryToSeed: (state) => {
      state.rawMaterials = [];
      state.readyProducts = [];
      state.wasteRecords = [];
      state.auditLogs = [];
    },

    setReadyProducts: (state, action: PayloadAction<ReadyProduct[]>) => {
      state.readyProducts = action.payload;
    },

    setRawMaterials: (state, action: PayloadAction<RawMaterial[]>) => {
      state.rawMaterials = action.payload;
    },
  },
});

export const {
  restockRawMaterial,
  addNewRawMaterial,
  addNewReadyProduct,
  setProductBOMId,
  unlinkProductBOM,
  executeProductionLifecycleRouting,
  consumeRawMaterialsForOrder,
  updateWasteStatus,
  resetInventoryToSeed,
  setReadyProducts,
  setRawMaterials,
} = inventorySlice.actions;

export default inventorySlice.reducer;
