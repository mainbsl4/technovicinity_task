'use client';

import React from 'react';
import { useAppSelector } from '@/lib/redux/hooks';
import { 
  BarChart3, 
  TrendingUp, 
  Recycle, 
  Trash2, 
  Boxes, 
  Sparkles,
  PieChart,
  CheckCircle2
} from 'lucide-react';

export const AnalyticsHub: React.FC = () => {
  const rawMaterials = useAppSelector((state) => state.inventory.rawMaterials);
  const readyProducts = useAppSelector((state) => state.inventory.readyProducts);
  const wasteRecords = useAppSelector((state) => state.inventory.wasteRecords);
  const orders = useAppSelector((state) => state.production.orders);

  // Waste summary by material
  const wasteByMaterial = wasteRecords.reduce((acc, r) => {
    if (!acc[r.materialName]) {
      acc[r.materialName] = {
        name: r.materialName,
        code: r.materialCode,
        quantity: 0,
        uom: r.uom,
        records: 0,
        recycled: 0,
        disposed: 0,
      };
    }
    acc[r.materialName].quantity += r.wasteQuantity;
    acc[r.materialName].records += 1;
    if (r.status === 'RECYCLED') acc[r.materialName].recycled += r.wasteQuantity;
    if (r.status === 'DISPOSED') acc[r.materialName].disposed += r.wasteQuantity;
    return acc;
  }, {} as Record<string, { name: string; code: string; quantity: number; uom: string; records: number; recycled: number; disposed: number }>);

  const wasteSummaryList = Object.values(wasteByMaterial);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            Industrial Yield & Material Loss Analytics
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Tracking material consumption efficiency, scrap generation, and waste recycling rates across manufacturing runs
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
            Average Run Yield: 98.4%
          </span>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Scrap Analysis by Material */}
        <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-400" />
              Scrap Distribution by Material
            </h3>
            <span className="text-[11px] text-zinc-500 font-mono">{wasteSummaryList.length} Materials Logged</span>
          </div>

          <div className="space-y-3">
            {wasteSummaryList.length === 0 ? (
              <p className="text-xs text-zinc-500 py-6 text-center">No scrap recorded yet.</p>
            ) : (
              wasteSummaryList.map((item) => (
                <div key={item.code} className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-zinc-200 block">{item.name}</span>
                      <span className="text-[10px] font-mono text-zinc-500">{item.code}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-amber-400 text-sm">
                        {item.quantity.toFixed(3)} {item.uom}
                      </span>
                      <span className="text-[10px] text-zinc-500 block">Across {item.records} runs</span>
                    </div>
                  </div>

                  {/* Progress bar representing recycled vs disposed */}
                  <div className="space-y-1">
                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden flex">
                      <div
                        title={`Recycled: ${item.recycled.toFixed(2)}`}
                        className="bg-emerald-500 h-full transition-all"
                        style={{ width: `${Math.min(100, (item.recycled / (item.quantity || 1)) * 100)}%` }}
                      />
                      <div
                        title={`Disposed: ${item.disposed.toFixed(2)}`}
                        className="bg-rose-500 h-full transition-all"
                        style={{ width: `${Math.min(100, (item.disposed / (item.quantity || 1)) * 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                      <span className="text-emerald-400">Recycled: {item.recycled.toFixed(2)} {item.uom}</span>
                      <span className="text-rose-400">Disposed: {item.disposed.toFixed(2)} {item.uom}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Output by Finished Good */}
        <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <Boxes className="w-4 h-4 text-cyan-400" />
              Finished Goods Production Output
            </h3>
            <span className="text-[11px] text-zinc-500 font-mono">{readyProducts.length} Product Models</span>
          </div>

          <div className="space-y-3">
            {readyProducts.map((prod) => (
              <div key={prod.id} className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-zinc-200 block">{prod.name}</span>
                    <span className="text-[10px] font-mono text-cyan-400">{prod.code}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-white text-sm">
                      {prod.totalProduced} {prod.uom} Total
                    </span>
                    <span className="text-[10px] text-emerald-400 block font-mono">
                      {prod.stockQuantity} Ready in Stock
                    </span>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between text-[11px] text-zinc-400 border-t border-zinc-800/60">
                  <span>Valuation: <strong>${(prod.stockQuantity * prod.unitValue).toFixed(2)}</strong></span>
                  <span className="font-mono text-zinc-500">Unit: ${prod.unitValue.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
