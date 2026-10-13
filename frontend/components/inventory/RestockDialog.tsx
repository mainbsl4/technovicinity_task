'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { restockRawMaterial } from '@/lib/redux/slices/inventorySlice';
import { api } from '@/lib/api';
import { Boxes, X, Check, ArrowUpRight } from 'lucide-react';

interface RestockDialogProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedMaterialId?: string;
}

export const RestockDialog: React.FC<RestockDialogProps> = ({
  isOpen,
  onClose,
  preselectedMaterialId,
}) => {
  const dispatch = useAppDispatch();
  const rawMaterials = useAppSelector((state) => state.inventory.rawMaterials);

  const [selectedId, setSelectedId] = useState<string>(
    preselectedMaterialId || (rawMaterials[0]?.id ?? '')
  );
  const [amount, setAmount] = useState<string>('50');
  const [operator, setOperator] = useState<string>('Inventory Receiving Clerk');
  const [notes, setNotes] = useState<string>('Standard supplier shipment intake');

  React.useEffect(() => {
    if (preselectedMaterialId) {
      setSelectedId(preselectedMaterialId);
    } else if (rawMaterials.length > 0 && !selectedId) {
      setSelectedId(rawMaterials[0].id);
    }
  }, [preselectedMaterialId, rawMaterials, selectedId]);

  if (!isOpen) return null;

  const currentMaterial = rawMaterials.find((m) => m.id === selectedId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(amount);
    if (!currentMaterial || isNaN(qty) || qty <= 0) return;

    dispatch(
      restockRawMaterial({
        materialId: currentMaterial.id,
        quantity: qty,
        actor: operator,
        notes,
      })
    );

    const newStock = Number((currentMaterial.stockQuantity + qty).toFixed(4));
    api.updateRawMaterialStock(currentMaterial.id, newStock).catch((err) => {
      console.warn('Backend restock patch failed:', err);
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Restock Raw Material</h2>
            <p className="text-xs text-zinc-400">Add incoming inventory replenishment to factory storage</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Select Raw Material
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 outline-none transition-colors"
            >
              {rawMaterials.map((rm) => (
                <option key={rm.id} value={rm.id}>
                  [{rm.code}] {rm.name} (Current: {rm.stockQuantity} {rm.uom})
                </option>
              ))}
            </select>
          </div>

          {currentMaterial && (
            <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 grid grid-cols-3 gap-3 text-center">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Current Stock</span>
                <span className="text-sm font-mono font-bold text-white">
                  {currentMaterial.stockQuantity} {currentMaterial.uom}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Safety Threshold</span>
                <span className="text-sm font-mono font-bold text-zinc-300">
                  {currentMaterial.minThreshold} {currentMaterial.uom}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Location</span>
                <span className="text-xs font-mono font-medium text-amber-400 truncate block">
                  {currentMaterial.location}
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Restock Quantity ({currentMaterial?.uom || 'units'})
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 100"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-lg px-3.5 py-2 text-sm text-zinc-100 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Operator / Receiver
              </label>
              <input
                type="text"
                required
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-lg px-3.5 py-2 text-sm text-zinc-100 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Receiving Notes / PO Reference
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. PO-2026-904 from Precision Alloys Inc."
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-lg px-3.5 py-2 text-sm text-zinc-100 outline-none"
            />
          </div>

          <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm rounded-lg shadow-lg shadow-amber-500/20 transition-all"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              Confirm Intake
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
