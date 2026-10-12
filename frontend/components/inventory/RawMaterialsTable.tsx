'use client';

import React, { useState } from 'react';
import { RawMaterial } from '@/lib/types';
import { 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight, 
  Search, 
  Filter, 
  Boxes,
  MapPin,
  TrendingDown
} from 'lucide-react';

interface RawMaterialsTableProps {
  materials: RawMaterial[];
  onRestock: (materialId: string) => void;
  onOpenNewMaterial: () => void;
}

export const RawMaterialsTable: React.FC<RawMaterialsTableProps> = ({
  materials,
  onRestock,
  onOpenNewMaterial,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const filtered = materials.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || m.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['ALL', ...Array.from(new Set(materials.map((m) => m.category)))];

  return (
    <div className="space-y-4">
      {/* Controls & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search raw material name, SKU, or rack location..."
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-100 outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Category:</span>
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 outline-none"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <button
            onClick={onOpenNewMaterial}
            className="text-xs font-bold px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg border border-zinc-700 transition-colors ml-auto"
          >
            + Register Item
          </button>
        </div>
      </div>

      {/* Materials Table */}
      <div className="rounded-xl border border-zinc-800 overflow-hidden bg-zinc-900/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/80 text-zinc-400 uppercase tracking-wider font-semibold text-[11px]">
                <th className="py-3 px-4">Material / SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Stock Level</th>
                <th className="py-3 px-4">Health Status</th>
                <th className="py-3 px-4">Storage Bin</th>
                <th className="py-3 px-4 text-right">Unit Cost</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    No raw materials match your filter.
                  </td>
                </tr>
              ) : (
                filtered.map((mat) => {
                  const isLow = mat.stockQuantity <= mat.minThreshold;
                  const ratio = Math.min(100, Math.round((mat.stockQuantity / (mat.minThreshold * 2.5)) * 100));

                  return (
                    <tr
                      key={mat.id}
                      className="hover:bg-zinc-800/30 transition-colors group"
                    >
                      {/* Name & Code */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-zinc-100">{mat.name}</div>
                        <div className="font-mono text-[11px] text-amber-400/90">{mat.code}</div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-[10px] font-medium border border-zinc-700">
                          {mat.category}
                        </span>
                      </td>

                      {/* Stock Level */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-white">
                            {mat.stockQuantity}
                          </span>
                          <span className="text-zinc-400 font-mono text-xs">{mat.uom}</span>
                        </div>
                        {/* Visual stock bar */}
                        <div className="w-28 h-1.5 bg-zinc-800 rounded-full overflow-hidden mt-1">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isLow ? 'bg-rose-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.max(8, ratio)}%` }}
                          />
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {isLow ? (
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400 font-semibold text-[11px]">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Low Stock (≤ {mat.minThreshold})</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium text-[11px]">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Optimal</span>
                          </div>
                        )}
                      </td>

                      {/* Location */}
                      <td className="py-3 px-4 text-zinc-400">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-zinc-500 flex-shrink-0" />
                          <span className="truncate max-w-[150px]">{mat.location}</span>
                        </div>
                      </td>

                      {/* Unit Cost */}
                      <td className="py-3 px-4 text-right font-mono text-zinc-300">
                        ${mat.unitCost.toFixed(2)}
                      </td>

                      {/* Quick Action */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onRestock(mat.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-zinc-300 text-xs font-semibold transition-all border border-zinc-700 hover:border-amber-400"
                        >
                          <Boxes className="w-3 h-3" />
                          <span>Restock</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
