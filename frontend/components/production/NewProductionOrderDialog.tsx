'use client';

import React, { useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { createProductionOrder } from '@/lib/redux/slices/productionSlice';
import { 
  consumeRawMaterialsForOrder, 
  executeProductionLifecycleRouting 
} from '@/lib/redux/slices/inventorySlice';
import { api } from '@/lib/api';
import { OrderMaterialRequirement, ProductionOrderStatus } from '@/lib/types';
import { 
  Plus, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  Layers, 
  Boxes, 
  ArrowRight,
  ShieldAlert,
  Percent
} from 'lucide-react';

interface NewProductionOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedBOMId?: string;
  onQuickRestock: (materialId: string) => void;
}

export const NewProductionOrderDialog: React.FC<NewProductionOrderDialogProps> = ({
  isOpen,
  onClose,
  preselectedBOMId,
  onQuickRestock,
}) => {
  const dispatch = useAppDispatch();
  const boms = useAppSelector((state) => state.bom.boms);
  const rawMaterials = useAppSelector((state) => state.inventory.rawMaterials);
  const readyProducts = useAppSelector((state) => state.inventory.readyProducts);

  const [selectedBOMId, setSelectedBOMId] = useState<string>(
    preselectedBOMId || (boms[0]?.id ?? '')
  );
  const [targetQuantity, setTargetQuantity] = useState<string>('25');
  const [operator, setOperator] = useState('Production Lead #04');
  const [line, setLine] = useState('Assembly Line Alpha');
  const [scheduledDate, setScheduledDate] = useState('2026-10-13');
  const [batchNumber, setBatchNumber] = useState('LOT-2026-042');
  const [initialStatus, setInitialStatus] = useState<ProductionOrderStatus>('IN_PROGRESS');
  const [notes, setNotes] = useState('Standard production run');

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const today = new Date().toISOString().split('T')[0];
      setScheduledDate(today);
      setBatchNumber(`LOT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
    }
  }, []);

  React.useEffect(() => {
    if (preselectedBOMId) {
      setSelectedBOMId(preselectedBOMId);
    } else if (boms.length > 0 && !selectedBOMId) {
      setSelectedBOMId(boms[0].id);
    }
  }, [preselectedBOMId, boms, selectedBOMId]);

  const selectedBOM = boms.find((b) => b.id === selectedBOMId) || boms[0];

  // Dynamic calculation of materials and inventory stock cross-check
  const parsedTargetQty = parseFloat(targetQuantity) || 0;

  const requirements: OrderMaterialRequirement[] = useMemo(() => {
    if (!selectedBOM || parsedTargetQty <= 0) return [];

    return selectedBOM.items.map((item) => {
      const liveMaterial = rawMaterials.find(
        (m) =>
          (item.materialId && m.id === item.materialId) ||
          (item.materialCode && m.code.toUpperCase() === item.materialCode.toUpperCase())
      );
      const currentStock = liveMaterial ? liveMaterial.stockQuantity : 0;
      const resolvedMaterialId = liveMaterial ? liveMaterial.id : item.materialId;

      const baseRequired = Number((item.quantityPerUnit * parsedTargetQty).toFixed(4));
      const expectedWasteQuantity = Number(
        ((baseRequired * item.wastePercentage) / 100).toFixed(4)
      );
      const totalRequired = Number((baseRequired + expectedWasteQuantity).toFixed(4));
      const isSufficient = currentStock >= totalRequired;
      const shortageQuantity = isSufficient
        ? 0
        : Number((totalRequired - currentStock).toFixed(4));

      return {
        materialId: resolvedMaterialId,
        materialCode: item.materialCode,
        materialName: item.materialName,
        uom: item.uom,
        baseRequired,
        wastePercentage: item.wastePercentage,
        expectedWasteQuantity,
        totalRequired,
        currentStock,
        shortageQuantity,
        isSufficient,
      };
    });
  }, [selectedBOM, parsedTargetQty, rawMaterials]);

  const hasShortage = requirements.some((r) => !r.isSufficient);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBOM || parsedTargetQty <= 0) return;

    const orderCount = Date.now().toString().slice(-4);
    const orderNumber = `WO-2026-${orderCount}`;
    const shouldDeductMaterials = initialStatus === 'IN_PROGRESS' || initialStatus === 'COMPLETED';

    const materialsConsumed = requirements.map((req) => ({
      materialId: req.materialId,
      materialCode: req.materialCode,
      materialName: req.materialName,
      baseRequired: req.baseRequired,
      wasteExpected: req.expectedWasteQuantity,
      totalDeducted: req.totalRequired,
      wastePercentage: req.wastePercentage,
      uom: req.uom,
    }));

    if (shouldDeductMaterials) {
      if (initialStatus === 'COMPLETED') {
        dispatch(
          executeProductionLifecycleRouting({
            orderNumber,
            productCode: selectedBOM.productCode,
            productName: selectedBOM.productName,
            completedQuantity: parsedTargetQty,
            outputUom: selectedBOM.outputUom,
            materialsConsumed,
            operator,
          })
        );
        const existingProd = readyProducts.find((p) => p.code === selectedBOM.productCode);
        const newStock = Number(((existingProd?.stockQuantity || 0) + parsedTargetQty).toFixed(4));
        const newTotal = Number(((existingProd?.totalProduced || 0) + parsedTargetQty).toFixed(4));
        api.updateProductStock(selectedBOM.productCode, newStock, newTotal).catch((err) => {
          console.warn('Backend product stock sync bypassed:', err);
        });
      } else {
        dispatch(
          consumeRawMaterialsForOrder({
            orderNumber,
            productCode: selectedBOM.productCode,
            materialsConsumed,
            operator,
          })
        );
      }

      // Dynamically update raw material stock on backend API
      requirements.forEach((req) => {
        const liveMat = rawMaterials.find(
          (m) =>
            (req.materialId && m.id === req.materialId) ||
            (req.materialCode && m.code.toUpperCase() === req.materialCode.toUpperCase())
        );
        if (liveMat) {
          const newStock = Math.max(0, Number((liveMat.stockQuantity - req.totalRequired).toFixed(4)));
          api.updateRawMaterialStock(liveMat.id || req.materialCode, newStock).catch((err) => {
            console.warn(`Backend update failed for ${req.materialCode}:`, err);
          });
        }
      });
    }

    dispatch(
      createProductionOrder({
        productCode: selectedBOM.productCode,
        productName: selectedBOM.productName,
        bomId: selectedBOM.id,
        targetQuantity: parsedTargetQty,
        uom: selectedBOM.outputUom,
        status: initialStatus,
        operator,
        line,
        batchNumber,
        scheduledDate,
        startedAt: initialStatus === 'IN_PROGRESS' || initialStatus === 'COMPLETED' ? new Date().toISOString() : undefined,
        completedAt: initialStatus === 'COMPLETED' ? new Date().toISOString() : undefined,
        actualProducedQuantity: initialStatus === 'COMPLETED' ? parsedTargetQty : undefined,
        notes,
        calculatedRequirements: requirements,
        materialsDeducted: shouldDeductMaterials,
      })
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-6 relative max-h-[92vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5 flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-zinc-950 font-black">
            <Play className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Create Manufacturing Work Order</h2>
            <p className="text-xs text-zinc-400">
              Input target output quantity to calculate raw materials & verify live inventory feasibility
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
          {/* Product & Quantity Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Target Product & BOM Recipe
              </label>
              <select
                value={selectedBOMId}
                onChange={(e) => setSelectedBOMId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none"
              >
                {boms.map((bom) => (
                  <option key={bom.id} value={bom.id}>
                    [{bom.productCode}] {bom.productName} (Rev {bom.version})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Target Production Qty ({selectedBOM?.outputUom || 'pcs'})
              </label>
              <input
                type="number"
                step="1"
                min="1"
                required
                value={targetQuantity}
                onChange={(e) => setTargetQuantity(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-lg px-3 py-2 text-xs text-amber-400 outline-none font-mono font-bold text-base"
              />
            </div>
          </div>

          {/* Operational Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Batch / Lot #
              </label>
              <input
                type="text"
                required
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-lg px-3 py-1.5 text-xs text-zinc-100 outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Production Line
              </label>
              <input
                type="text"
                required
                value={line}
                onChange={(e) => setLine(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-lg px-3 py-1.5 text-xs text-zinc-100 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Operator / Lead
              </label>
              <input
                type="text"
                required
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-lg px-3 py-1.5 text-xs text-zinc-100 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Initial State
              </label>
              <select
                value={initialStatus}
                onChange={(e) => setInitialStatus(e.target.value as ProductionOrderStatus)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 outline-none"
              >
                <option value="IN_PROGRESS">Run In-Progress (Deduct Materials)</option>
                <option value="COMPLETED">Instant Output (Deduct RM + Output FG)</option>
                <option value="STAGED">Staged for Shift (Reserve only)</option>
                <option value="DRAFT">Draft Order</option>
              </select>
            </div>
          </div>

          {/* DYNAMIC RAW MATERIAL INVENTORY FEASIBILITY CHECK */}
          <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950/70 mt-3">
            <div className="p-3 bg-zinc-900/80 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Boxes className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Raw Material Stock Feasibility Cross-Check
                </span>
              </div>
              <div>
                {hasShortage ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 text-[11px] font-bold">
                    <AlertTriangle className="w-3 h-3" />
                    Material Shortage Detected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[11px] font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    100% Stock Available
                  </span>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/40 text-[10px] text-zinc-400 uppercase tracking-wider">
                    <th className="py-2 px-3">Raw Material</th>
                    <th className="py-2 px-3">Net Base Qty</th>
                    <th className="py-2 px-3">BOM Waste %</th>
                    <th className="py-2 px-3">Gross Total Required</th>
                    <th className="py-2 px-3">Stock on Hand</th>
                    <th className="py-2 px-3 text-right">Feasibility</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-sans">
                  {requirements.map((req) => (
                    <tr
                      key={req.materialId || req.materialCode}
                      className={!req.isSufficient ? 'bg-rose-950/20' : 'hover:bg-zinc-800/20'}
                    >
                      {/* Material */}
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-zinc-200">{req.materialName}</div>
                        <div className="font-mono text-[10px] text-zinc-500">{req.materialCode}</div>
                      </td>

                      {/* Net base */}
                      <td className="py-2.5 px-3 font-mono text-zinc-300">
                        {req.baseRequired} {req.uom}
                      </td>

                      {/* Waste % */}
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-0.5 text-amber-400 font-mono text-[11px] font-semibold">
                          <Percent className="w-2.5 h-2.5" />
                          {req.wastePercentage}%
                        </span>
                        <span className="text-[10px] text-zinc-500 block font-mono">
                          (+{req.expectedWasteQuantity} {req.uom})
                        </span>
                      </td>

                      {/* Total Gross */}
                      <td className="py-2.5 px-3 font-mono font-bold text-white">
                        {req.totalRequired} {req.uom}
                      </td>

                      {/* Current Stock */}
                      <td className="py-2.5 px-3 font-mono">
                        <span className={req.isSufficient ? 'text-zinc-200' : 'text-rose-400 font-bold'}>
                          {req.currentStock} {req.uom}
                        </span>
                      </td>

                      {/* Status / Restock button */}
                      <td className="py-2.5 px-3 text-right">
                        {req.isSufficient ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            OK
                          </span>
                        ) : (
                          <div className="inline-flex items-center gap-2">
                            <span className="text-rose-400 font-bold font-mono text-[11px]">
                              Short by {req.shortageQuantity} {req.uom}
                            </span>
                            <button
                              type="button"
                              onClick={() => onQuickRestock(req.materialId)}
                              className="px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded text-[10px] font-bold"
                            >
                              Restock Now
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {hasShortage && (
              <div className="p-2.5 bg-rose-500/10 border-t border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>
                  <strong>Inventory Warning:</strong> Total raw materials required exceed current stock on hand. You can still stage or submit the order, or click <strong>Restock Now</strong> above to replenish the inventory.
                </span>
              </div>
            )}
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
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs rounded-lg shadow-lg shadow-amber-500/20 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Production Run</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
