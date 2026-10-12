import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProductionOrder, ProductionOrderStatus } from '../../types';
import { SEED_PRODUCTION_ORDERS } from '../../data/seedData';

interface ProductionState {
  orders: ProductionOrder[];
}

const initialState: ProductionState = {
  orders: SEED_PRODUCTION_ORDERS,
};

export const productionSlice = createSlice({
  name: 'production',
  initialState,
  reducers: {
    createProductionOrder: (
      state,
      action: PayloadAction<Omit<ProductionOrder, 'id' | 'orderNumber'>>
    ) => {
      const orderCount = state.orders.length + 43;
      const orderNumber = `WO-2026-${orderCount.toString().padStart(4, '0')}`;
      const newOrder: ProductionOrder = {
        ...action.payload,
        id: `wo-${Date.now()}`,
        orderNumber,
      };
      state.orders.unshift(newOrder);
    },

    updateOrderStatus: (
      state,
      action: PayloadAction<{ orderId: string; status: ProductionOrderStatus; notes?: string }>
    ) => {
      const order = state.orders.find((o) => o.id === action.payload.orderId);
      if (order) {
        order.status = action.payload.status;
        if (action.payload.status === 'IN_PROGRESS' && !order.startedAt) {
          order.startedAt = new Date().toISOString();
        }
        if (action.payload.notes) {
          order.notes = action.payload.notes;
        }
      }
    },

    completeProductionOrder: (
      state,
      action: PayloadAction<{ orderId: string; actualQuantity?: number; notes?: string }>
    ) => {
      const order = state.orders.find((o) => o.id === action.payload.orderId);
      if (order) {
        order.status = 'COMPLETED';
        order.completedAt = new Date().toISOString();
        order.actualProducedQuantity = action.payload.actualQuantity || order.targetQuantity;
        if (action.payload.notes) {
          order.notes = action.payload.notes;
        }
      }
    },

    cancelProductionOrder: (state, action: PayloadAction<{ orderId: string; reason?: string }>) => {
      const order = state.orders.find((o) => o.id === action.payload.orderId);
      if (order) {
        order.status = 'CANCELLED';
        if (action.payload.reason) {
          order.notes = `Cancelled: ${action.payload.reason}`;
        }
      }
    },

    resetOrdersToSeed: (state) => {
      state.orders = SEED_PRODUCTION_ORDERS;
    },
  },
});

export const {
  createProductionOrder,
  updateOrderStatus,
  completeProductionOrder,
  cancelProductionOrder,
  resetOrdersToSeed,
} = productionSlice.actions;

export default productionSlice.reducer;
