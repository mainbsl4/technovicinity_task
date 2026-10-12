'use client';

import React, { useState } from 'react';
import { useAppDispatch } from '@/lib/redux/hooks';
import { addNewRawMaterial } from '@/lib/redux/slices/inventorySlice';
import { UnitOfMeasure, RawMaterial } from '@/lib/types';
import { PackagePlus, X, Check } from 'lucide-react';

interface NewRawMaterialDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewRawMaterialDialog: React.FC<NewRawMaterialDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const dispatch = useAppDispatch();

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<RawMaterial['category']>('Metals');
  const [stockQuantity, setStockQuantity] = useState('100');
  const [uom, setUom] = useState<UnitOfMeasure>('kg');
  const [minThreshold, setMinThreshold] = useState('20');
  const [unitCost, setUnitCost] = useState('15.00');
  const [location, setLocation] = useState('Warehouse Zone C - Bin 04');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) return;

    dispatch(
      addNewRawMaterial({
        code: code.trim().toUpperCase(),
        name: name.trim(),
        category,
        stockQuantity: parseFloat(stockQuantity) || 0,
        uom,
        minThreshold: parseFloat(minThreshold) || 0,
        unitCost: parseFloat(unitCost) || 0,
        location: location.trim(),
      })
    );

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
            <PackagePlus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Register Raw Material</h2>
            <p className="text-xs text-zinc-400">Add a new manufacturing component to inventory</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Material Code / SKU
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. RM-COPPER-ROD"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-lg px-3.5 py-2 text-sm text-zinc-100 outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as RawMaterial['category'])}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-lg px-3.5 py-2 text-sm text-zinc-100 outline-none"
              >
                <option value="Metals">Metals</option>
                <option value="Electronics">Electronics</option>
                <option value="Plastics">Plastics</option>
                <option value="Chemicals">Chemicals</option>
                <option value="Packaging">Packaging</option>
                <option value="Textiles">Textiles</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Material Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Oxygen-Free High Thermal Conductivity Copper"
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-lg px-3.5 py-2 text-sm text-zinc-100 outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Initial Stock
              </label>
              <input
                type="number"
                step="any"
                min="0"
                required
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Unit (UOM)
              </label>
              <select
                value={uom}
                onChange={(e) => setUom(e.target.value as UnitOfMeasure)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none"
              >
                <option value="kg">kg (Kilograms)</option>
                <option value="g">g (Grams)</option>
                <option value="pcs">pcs (Pieces)</option>
                <option value="m">m (Meters)</option>
                <option value="ml">ml (Milliliters)</option>
                <option value="l">l (Liters)</option>
                <option value="boxes">boxes (Boxes)</option>
                <option value="sheets">sheets (Sheets)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Reorder Alert
              </label>
              <input
                type="number"
                step="any"
                min="0"
                required
                value={minThreshold}
                onChange={(e) => setMinThreshold(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Unit Cost ($ USD)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-lg px-3.5 py-2 text-sm text-zinc-100 outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Warehouse Location
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Rack 02, Shelf B"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-lg px-3.5 py-2 text-sm text-zinc-100 outline-none"
              />
            </div>
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
              Save to Catalog
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
