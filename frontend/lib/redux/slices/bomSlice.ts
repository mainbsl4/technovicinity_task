import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BillOfMaterials } from '../../types';
import { SEED_BOMS } from '../../data/seedData';

interface BOMState {
  boms: BillOfMaterials[];
}

const initialState: BOMState = {
  boms: SEED_BOMS,
};

export const bomSlice = createSlice({
  name: 'bom',
  initialState,
  reducers: {
    addBOM: (state, action: PayloadAction<Omit<BillOfMaterials, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const now = new Date().toISOString();
      const newBOM: BillOfMaterials = {
        ...action.payload,
        id: `bom-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      };
      state.boms.unshift(newBOM);
    },

    updateBOM: (state, action: PayloadAction<BillOfMaterials>) => {
      const index = state.boms.findIndex((b) => b.id === action.payload.id);
      if (index !== -1) {
        state.boms[index] = {
          ...action.payload,
          updatedAt: new Date().toISOString(),
        };
      }
    },

    deleteBOM: (state, action: PayloadAction<string>) => {
      state.boms = state.boms.filter((b) => b.id !== action.payload);
    },

    resetBOMsToSeed: (state) => {
      state.boms = SEED_BOMS;
    },
  },
});

export const { addBOM, updateBOM, deleteBOM, resetBOMsToSeed } = bomSlice.actions;

export default bomSlice.reducer;
