'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { addBOM, updateBOM } from '@/lib/redux/slices/bomSlice';
import { BillOfMaterials, BOMMaterialItem, UnitOfMeasure } from '@/lib/types';
import { 
  Layers, 
  X, 
  Plus, 
  Trash2, 
  AlertCircle, 
  Check, 
  Sparkles,
  Info
} from 'lucide-react';

interface BOMEditorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingBOM?: BillOfMaterials | null;
}

export const BOMEditorDialog: React.FC<BOMEditorDialogProps> = ({
  isOpen,
  onClose,
  editingBOM,
}) => {
  const dispatch = useAppDispatch();
  const rawMaterials = useAppSelector((state) => state.inventory.rawMaterials);

  const [productCode, setProductCode] = useState(editingBOM?.productCode || '');
  const [productName, setProductName] = useState(editingBOM?.productName || '');
  const [description, setDescription] = useState(editingBOM?.description || '');
  const [version, setVersion] = useState(editingBOM?.version || '1.0');
  const [outputUom, setOutputUom] = useState<UnitOfMeasure>(editingBOM?.outputUom || 'pcs');

  const [items, setItems] = useState<BOMMaterialItem[]>(
    editingBOM?.items || [
      {
        id: `bi-new-1`,
        materialId: rawMaterials[0]?.id || '',
        materialCode: rawMaterials[0]?.code || '',
        materialName: rawMaterials[0]?.name || '',
        quantityPerUnit: 1,
        uom: rawMaterials[0]?.uom || 'pcs',
        wastePercentage: 2.0,
      },
    ]
  );

  React.useEffect(() => {
    if (editingBOM) {
      setProductCode(editingBOM.productCode);
      setProductName(editingBOM.productName);
      setDescription(editingBOM.description);
      setVersion(editingBOM.version);
      setOutputUom(editingBOM.outputUom);
      setItems(editingBOM.items);
    } else {
      setProductCode('');
      setProductName('');
      setDescription('');
      setVersion('1.0');
      setOutputUom('pcs');
      if (rawMaterials.length > 0) {
        setItems([
          {
            id: `bi-new-${Date.now()}`,
            materialId: rawMaterials[0].id,
            materialCode: rawMaterials[0].code,
            materialName: rawMaterials[0].name,
            quantityPerUnit: 1,
            uom: rawMaterials[0].uom,
            wastePercentage: 2.0,
          },
        ]);
      }
    }
  }, [editingBOM, rawMaterials]);

  if (!isOpen) return null;

  const handleAddMaterialRow = () => {
    if (rawMaterials.length === 0) return;
    const defaultMat = rawMaterials[0];
    setItems([
      ...items,
      {
        id: `bi-row-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        materialId: defaultMat.id,
        materialCode: defaultMat.code,
        materialName: defaultMat.name,
        quantityPerUnit: 1,
        uom: defaultMat.uom,
        wastePercentage: 1.5,
      },
    ]);
  };

  const handleRemoveMaterialRow = (id: string) => {
    if (items.length <= 1) return;
    setItems(items.filter((item) => item.id !== id));
  };

  const handleMaterialChange = (rowId: string, materialId: string) => {
    const found = rawMaterials.find((m) => m.id === materialId);
    if (!found) return;

    setItems(
      items.map((row) =>
        row.id === rowId
          ? {
              ...row,
              materialId: found.id,
              materialCode: found.code,
              materialName: found.name,
              uom: found.uom,
            }
          : row
      )
    );
  };

  const handleQuantityChange = (rowId: string, value: string) => {
    const qty = parseFloat(value) || 0;
    setItems(
      items.map((row) => (row.id === rowId ? { ...row, quantityPerUnit: qty } : row))
    );
  };

  const handleWastePercentChange = (rowId: string, value: string) => {
    const wp = parseFloat(value) || 0;
    setItems(
      items.map((row) => (row.id === rowId ? { ...row, wastePercentage: wp } : row))
    );
  };

  // Calculate estimated unit cost
  const estimatedTotalCost = items.reduce((acc, row) => {
    const mat = rawMaterials.find((m) => m.id === row.materialId);
    if (!mat) return acc;
    const totalQtyNeeded = row.quantityPerUnit * (1 + row.wastePercentage / 100);
    return acc + totalQtyNeeded * mat.unitCost;
  }, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productCode || !productName || items.length === 0) return;

    if (editingBOM) {
      dispatch(
        updateBOM({
          ...editingBOM,
          productCode: productCode.trim().toUpperCase(),
          productName: productName.trim(),
          description: description.trim(),
          version: version.trim(),
          outputUom,
          items,
          estimatedUnitCost: Number(estimatedTotalCost.toFixed(2)),
          updatedAt: new Date().toISOString(),
        })
      );
    } else {
      dispatch(
        addBOM({
          productCode: productCode.trim().toUpperCase(),
          productName: productName.trim(),
          description: description.trim(),
          version: version.trim(),
          outputUom,
          baseQuantity: 1,
          items,
          estimatedUnitCost: Number(estimatedTotalCost.toFixed(2)),
        })
      );
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-3xl rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-6 relative max-h-[92vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5 flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              {editingBOM ? 'Edit Bill of Materials (BOM)' : 'Create Bill of Materials (BOM)'}
            </h2>
            <p className="text-xs text-zinc-400">
              Define manufacturing recipe: Static product code, required raw materials, units, and waste percentages
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
          {/* Product Code & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Static Product Code / SKU
              </label>
              <input
                type="text"
                required
                value={productCode}
                onChange={(e) => setProductCode(e.target.value)}
                placeholder="e.g. FG-ROBOT-ARM"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none font-mono font-bold"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Finished Product Name
              </label>
              <input
                type="text"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. High-Torque Robotic Arm Actuator"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Description / Application
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Factory floor autonomous positioning module"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                  Revision
                </label>
                <input
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                  Output Unit
                </label>
                <select
                  value={outputUom}
                  onChange={(e) => setOutputUom(e.target.value as UnitOfMeasure)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-lg px-2 py-2 text-xs text-zinc-100 outline-none font-mono"
                >
                  <option value="pcs">pcs</option>
                  <option value="kg">kg</option>
                  <option value="boxes">boxes</option>
                  <option value="m">m</option>
                  <option value="l">l</option>
                </select>
              </div>
            </div>
          </div>

          {/* Raw Materials Recipe Mapping Table */}
          <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950/50 mt-4">
            <div className="p-3 bg-zinc-900/80 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Raw Materials & Loss Percentages
                </span>
                <span className="text-[11px] text-zinc-400">
                  Predefined waste % automatically routes scrap to waste inventory upon run completion
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddMaterialRow}
                className="flex items-center gap-1 px-3 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg text-xs font-bold transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Ingredient</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-[10px] text-zinc-400 uppercase tracking-wider font-semibold bg-zinc-900/40">
                    <th className="py-2.5 px-3">Raw Material</th>
                    <th className="py-2.5 px-3 w-32">Qty Per 1 {outputUom}</th>
                    <th className="py-2.5 px-3 w-28">Predefined Waste %</th>
                    <th className="py-2.5 px-3">Effective Intake</th>
                    <th className="py-2.5 px-2 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {items.map((row) => {
                    const totalPerUnit = row.quantityPerUnit * (1 + row.wastePercentage / 100);
                    return (
                      <tr key={row.id} className="hover:bg-zinc-800/20">
                        {/* Material Selector */}
                        <td className="py-2 px-3">
                          <select
                            value={row.materialId}
                            onChange={(e) => handleMaterialChange(row.id, e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700 focus:border-cyan-500 rounded px-2.5 py-1.5 text-xs text-zinc-100 outline-none"
                          >
                            {rawMaterials.map((rm) => (
                              <option key={rm.id} value={rm.id}>
                                [{rm.code}] {rm.name} ({rm.uom})
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Quantity */}
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              step="any"
                              min="0.0001"
                              required
                              value={row.quantityPerUnit}
                              onChange={(e) => handleQuantityChange(row.id, e.target.value)}
                              className="w-20 bg-zinc-900 border border-zinc-700 focus:border-cyan-500 rounded px-2 py-1.5 text-xs text-zinc-100 font-mono"
                            />
                            <span className="text-[11px] font-mono text-zinc-400">{row.uom}</span>
                          </div>
                        </td>

                        {/* Predefined Waste % */}
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="100"
                              required
                              value={row.wastePercentage}
                              onChange={(e) => handleWastePercentChange(row.id, e.target.value)}
                              className="w-16 bg-zinc-900 border border-zinc-700 focus:border-cyan-500 rounded px-2 py-1.5 text-xs text-amber-300 font-mono font-bold"
                            />
                            <span className="text-zinc-400 font-mono">%</span>
                          </div>
                        </td>

                        {/* Effective Consumption */}
                        <td className="py-2 px-3">
                          <div className="font-mono text-xs text-zinc-300 font-medium">
                            {totalPerUnit.toFixed(3)} {row.uom}
                          </div>
                          <div className="text-[10px] text-zinc-500">
                            (+{(row.quantityPerUnit * (row.wastePercentage / 100)).toFixed(3)} scrap)
                          </div>
                        </td>

                        {/* Delete Row */}
                        <td className="py-2 px-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveMaterialRow(row.id)}
                            disabled={items.length <= 1}
                            className="p-1 rounded text-zinc-500 hover:text-rose-400 disabled:opacity-30 disabled:hover:text-zinc-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Recipe Footer Summary */}
            <div className="p-3 bg-zinc-900/80 border-t border-zinc-800 flex items-center justify-between text-xs">
              <span className="text-zinc-400">Total Materials in Recipe: <strong className="text-white">{items.length} items</strong></span>
              <span className="text-zinc-400">
                Estimated Material Unit Cost: <strong className="text-cyan-400 font-mono">${estimatedTotalCost.toFixed(2)} / {outputUom}</strong>
              </span>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs rounded-lg shadow-lg shadow-cyan-500/20 transition-all"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              {editingBOM ? 'Update Recipe' : 'Save BOM Recipe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
