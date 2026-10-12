'use client';

import React from 'react';
import { 
  Factory, 
  RotateCcw, 
  Plus, 
  Layers, 
  Boxes, 
  CheckCircle2, 
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { resetInventoryToSeed } from '@/lib/redux/slices/inventorySlice';
import { resetBOMsToSeed } from '@/lib/redux/slices/bomSlice';
import { resetOrdersToSeed } from '@/lib/redux/slices/productionSlice';

interface AppHeaderProps {
  onOpenNewOrder: () => void;
  onOpenNewBOM: () => void;
  onOpenRestock: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onOpenNewOrder,
  onOpenNewBOM,
  onOpenRestock,
}) => {
  const dispatch = useAppDispatch();
  const rawMaterials = useAppSelector((state) => state.inventory.rawMaterials);
  const lowStockCount = rawMaterials.filter((m) => m.stockQuantity <= m.minThreshold).length;

  const handleResetSeedData = () => {
    if (confirm('Reset entire system (Inventory, BOMs, Work Orders, Waste) back to default factory demo data?')) {
      dispatch(resetInventoryToSeed());
      dispatch(resetBOMsToSeed());
      dispatch(resetOrdersToSeed());
      localStorage.removeItem('vortex_mes_state_v1');
    }
  };

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur sticky top-0 z-30 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Brand & Floor Status */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-zinc-950 shadow-lg shadow-amber-500/20 font-black">
            <Factory className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wider text-lg text-white font-mono">
                VORTEX<span className="text-amber-400">.MES</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300">
                Plant 01
              </span>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Shop Floor Online</span>
              </div>
            </div>
            <p className="text-xs text-zinc-400 hidden sm:block">
              Industrial Lifecycle Engine: Raw Materials • BOM Recipes • Production Routing • Waste Tracking
            </p>
          </div>
        </div>

        {/* Global Action Bar */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          {lowStockCount > 0 && (
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{lowStockCount} raw material{lowStockCount > 1 ? 's' : ''} below reorder level</span>
            </div>
          )}

          {/* Reset Demo Data button */}
          <button
            onClick={handleResetSeedData}
            title="Reset system to fresh industrial sample state"
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Demo</span>
          </button>

          {/* Quick Restock */}
          <button
            onClick={onOpenRestock}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-zinc-200 hover:text-white transition-all shadow-sm"
          >
            <Boxes className="w-3.5 h-3.5 text-amber-400" />
            <span>Restock RM</span>
          </button>

          {/* Create BOM Recipe */}
          <button
            onClick={onOpenNewBOM}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-zinc-200 hover:text-white transition-all shadow-sm"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>New BOM</span>
          </button>

          {/* New Production Order */}
          <button
            onClick={onOpenNewOrder}
            className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 transition-all shadow-md shadow-amber-500/25 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Run Production</span>
          </button>
        </div>
      </div>
    </header>
  );
};
