'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { BillOfMaterials } from '@/lib/types';
import { deleteBOM } from '@/lib/redux/slices/bomSlice';
import { BOMEditorDialog } from './BOMEditorDialog';
import { 
  Layers, 
  Plus, 
  Search, 
  Play, 
  Edit3, 
  Trash2, 
  Boxes, 
  Percent, 
  DollarSign, 
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface BOMHubProps {
  onProduceFromBOM: (bomId: string) => void;
  onOpenNewBOM: () => void;
}

export const BOMHub: React.FC<BOMHubProps> = ({
  onProduceFromBOM,
  onOpenNewBOM,
}) => {
  const dispatch = useAppDispatch();
  const boms = useAppSelector((state) => state.bom.boms);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingBOM, setEditingBOM] = useState<BillOfMaterials | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [expandedBOMId, setExpandedBOMId] = useState<string | null>(boms[0]?.id || null);

  const filtered = boms.filter(
    (b) =>
      b.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete BOM recipe for "${name}"?`)) {
      dispatch(deleteBOM(id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search recipes by product code or name..."
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-100 outline-none"
          />
        </div>

        <button
          onClick={onOpenNewBOM}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs rounded-lg shadow-md shadow-cyan-500/20 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Recipe (BOM)</span>
        </button>
      </div>

      {/* BOM Cards List */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.length === 0 ? (
          <div className="py-16 text-center border border-zinc-800 rounded-2xl bg-zinc-900/40 text-zinc-500 text-sm">
            No Bill of Materials recipes match your query.
          </div>
        ) : (
          filtered.map((bom) => {
            const isExpanded = expandedBOMId === bom.id;

            return (
              <div
                key={bom.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 transition-all overflow-hidden"
              >
                {/* Header Row */}
                <div className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0 mt-0.5">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-zinc-800 border border-zinc-700 text-cyan-400 font-bold">
                          {bom.productCode}
                        </span>
                        <h3 className="text-base font-bold text-white">{bom.productName}</h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                          Rev {bom.version}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1 max-w-2xl">{bom.description}</p>
                    </div>
                  </div>

                  {/* Actions & Metrics */}
                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                    <div className="px-3 py-1.5 rounded-lg bg-zinc-950/80 border border-zinc-800 text-right mr-2">
                      <span className="text-[10px] text-zinc-500 block uppercase tracking-wider">Unit Cost</span>
                      <span className="font-mono text-xs font-bold text-emerald-400">
                        ${bom.estimatedUnitCost.toFixed(2)} / {bom.outputUom}
                      </span>
                    </div>

                    <button
                      onClick={() => onProduceFromBOM(bom.id)}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs rounded-lg shadow-sm transition-all active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Produce Run</span>
                    </button>

                    <button
                      onClick={() => {
                        setEditingBOM(bom);
                        setIsEditorOpen(true);
                      }}
                      className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                      title="Edit Recipe"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(bom.id, bom.productName)}
                      className="p-2 rounded-lg bg-zinc-800 hover:bg-rose-950/60 text-zinc-400 hover:text-rose-400 transition-colors"
                      title="Delete Recipe"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setExpandedBOMId(isExpanded ? null : bom.id)}
                      className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                      title={isExpanded ? 'Collapse Ingredients' : 'Expand Ingredients'}
                    >
                      <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Expanded Ingredients Table */}
                {isExpanded && (
                  <div className="border-t border-zinc-800 bg-zinc-950/60 p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                        <Boxes className="w-4 h-4 text-cyan-400" />
                        Required Raw Materials & Scrap Formulas
                      </span>
                      <span className="text-[11px] text-zinc-500 font-mono">
                        Base: 1 {bom.outputUom}
                      </span>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-zinc-800/80">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-zinc-800 bg-zinc-900/60 text-zinc-400 text-[10px] uppercase tracking-wider">
                            <th className="py-2.5 px-3">Raw Material</th>
                            <th className="py-2.5 px-3">SKU</th>
                            <th className="py-2.5 px-3">Net Requirement</th>
                            <th className="py-2.5 px-3">BOM Waste %</th>
                            <th className="py-2.5 px-3">Expected Scrap Loss</th>
                            <th className="py-2.5 px-3">Gross Material Intake</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/60 font-sans">
                          {bom.items.map((item) => {
                            const scrap = (item.quantityPerUnit * item.wastePercentage) / 100;
                            const gross = item.quantityPerUnit + scrap;

                            return (
                              <tr key={item.id} className="hover:bg-zinc-800/20">
                                <td className="py-2 px-3 font-semibold text-zinc-200">
                                  {item.materialName}
                                </td>
                                <td className="py-2 px-3 font-mono text-zinc-400 text-[11px]">
                                  {item.materialCode}
                                </td>
                                <td className="py-2 px-3 font-mono font-medium text-white">
                                  {item.quantityPerUnit} {item.uom}
                                </td>
                                <td className="py-2 px-3">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-bold text-[11px]">
                                    <Percent className="w-2.5 h-2.5" />
                                    {item.wastePercentage}%
                                  </span>
                                </td>
                                <td className="py-2 px-3 font-mono text-rose-400 text-[11px]">
                                  +{scrap.toFixed(3)} {item.uom}
                                </td>
                                <td className="py-2 px-3 font-mono font-bold text-cyan-300">
                                  {gross.toFixed(3)} {item.uom}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Editor Modal */}
      {isEditorOpen && (
        <BOMEditorDialog
          isOpen={isEditorOpen}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingBOM(null);
          }}
          editingBOM={editingBOM}
        />
      )}
    </div>
  );
};
