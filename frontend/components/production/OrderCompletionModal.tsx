'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { ProductionOrder } from '@/lib/types';
import { executeProductionLifecycleRouting } from '@/lib/redux/slices/inventorySlice';
import { completeProductionOrder } from '@/lib/redux/slices/productionSlice';
import { 
  CheckCircle2, 
  X, 
  ArrowRight, 
  Boxes, 
  PackageCheck, 
  Trash2, 
  History,
  Sparkles,
  Layers,
  AlertCircle
} from 'lucide-react';

interface OrderCompletionModalProps {
  order: ProductionOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderCompletionModal: React.FC<OrderCompletionModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const boms = useAppSelector((state) => state.bom.boms);
  const rawMaterials = useAppSelector((state) => state.inventory.rawMaterials);

  const [actualQuantity, setActualQuantity] = useState<string>(
    order ? order.targetQuantity.toString() : '1'
  );
  const [operatorNote, setOperatorNote] = useState<string>('Run passed QA final inspection with 100% compliance.');
  const [isSuccess, setIsSuccess] = useState(false);

  React.useEffect(() => {
    if (order) {
      setActualQuantity(order.targetQuantity.toString());
      setIsSuccess(false);
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const bom = boms.find((b) => b.id === order.bomId);
  const completedQty = parseFloat(actualQuantity) || order.targetQuantity;

  // Calculate material consumption & waste based on BOM
  const consumptionPlan = bom
    ? bom.items.map((item) => {
        const baseRequired = Number((item.quantityPerUnit * completedQty).toFixed(4));
        const wasteExpected = Number(
          ((baseRequired * item.wastePercentage) / 100).toFixed(4)
        );
        const totalDeducted = Number((baseRequired + wasteExpected).toFixed(4));

        return {
          materialId: item.materialId,
          materialCode: item.materialCode,
          materialName: item.materialName,
          baseRequired,
          wasteExpected,
          totalDeducted,
          wastePercentage: item.wastePercentage,
          uom: item.uom,
        };
      })
    : [];

  const handleConfirmCompletion = () => {
    if (!bom) return;

    // 1. Dispatch Automated Lifecycle Routing to Inventory
    dispatch(
      executeProductionLifecycleRouting({
        orderNumber: order.orderNumber,
        productCode: order.productCode,
        productName: order.productName,
        completedQuantity: completedQty,
        outputUom: order.uom,
        materialsConsumed: consumptionPlan,
        operator: order.operator,
      })
    );

    // 2. Mark Production Order as COMPLETED
    dispatch(
      completeProductionOrder({
        orderId: order.id,
        actualQuantity: completedQty,
        notes: operatorNote,
      })
    );

    setIsSuccess(true);
    setTimeout(() => {
      onClose();
      setIsSuccess(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-6 relative max-h-[92vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5 flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              Complete Production Run & Execute Lifecycle Routing
            </h2>
            <p className="text-xs text-zinc-400">
              Work Order: <span className="font-mono text-amber-400 font-bold">{order.orderNumber}</span> • Batch: <span className="font-mono text-zinc-300">{order.batchNumber}</span>
            </p>
          </div>
        </div>

        {isSuccess ? (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 animate-bounce">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Lifecycle Routing Completed!</h3>
            <p className="text-xs text-zinc-400 max-w-md">
              Finished products credited to Ready Products, raw materials deducted, and calculated scrap forwarded to Waste Management inventory.
            </p>
          </div>
        ) : (
          <div className="space-y-4 overflow-y-auto pr-1 flex-1">
            {/* Produced Output Confirmation */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Target Units vs Actual Completed
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={actualQuantity}
                    onChange={(e) => setActualQuantity(e.target.value)}
                    className="w-28 bg-zinc-900 border border-zinc-700 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-white font-mono font-bold"
                  />
                  <span className="text-xs font-mono text-zinc-400">
                    {order.uom} of {order.productName}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Inspection / Operator Sign-Off
                </label>
                <input
                  type="text"
                  value={operatorNote}
                  onChange={(e) => setOperatorNote(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none"
                />
              </div>
            </div>

            {/* THREE AUTOMATED LIFECYCLE ROUTING PILLARS */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 block">
                Automated Lifecycle Routing Manifest
              </span>

              {/* 1. Ready Product Credit */}
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <PackageCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase font-bold text-emerald-400 tracking-wider block">
                      1. Route to Ready Products (Finished Goods)
                    </span>
                    <span className="text-xs text-zinc-200 font-medium">
                      {order.productName} [{order.productCode}]
                    </span>
                  </div>
                </div>
                <div className="font-mono text-sm font-bold text-emerald-400">
                  +{completedQty} {order.uom}
                </div>
              </div>

              {/* 2. Raw Material Consumption */}
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
                <div className="flex items-center gap-2 mb-2">
                  <Boxes className="w-4 h-4 text-amber-400" />
                  <span className="text-[11px] uppercase font-bold text-amber-400 tracking-wider">
                    2. Deduct from Raw Materials Inventory
                  </span>
                </div>
                <div className="space-y-1.5 pl-6 border-l border-zinc-800 text-xs">
                  {consumptionPlan.map((c) => (
                    <div key={c.materialId} className="flex items-center justify-between py-0.5">
                      <span className="text-zinc-300 font-medium">
                        {c.materialName} ({c.baseRequired} net + {c.wasteExpected} scrap)
                      </span>
                      <span className="font-mono font-bold text-rose-400">
                        -{c.totalDeducted} {c.uom}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Waste Routing */}
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-rose-400" />
                    <span className="text-[11px] uppercase font-bold text-rose-400 tracking-wider">
                      3. Route Calculated Loss to Waste Management
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    Based on Predefined BOM Waste %
                  </span>
                </div>
                <div className="space-y-1.5 pl-6 border-l border-rose-500/20 text-xs">
                  {consumptionPlan.map((c) => (
                    <div key={c.materialId} className="flex items-center justify-between py-0.5">
                      <span className="text-zinc-300 font-medium">
                        {c.materialName} ({c.wastePercentage}% tolerance scrap)
                      </span>
                      <span className="font-mono font-bold text-amber-400">
                        +{c.wasteExpected} {c.uom}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCompletion}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-zinc-950 font-bold text-xs rounded-lg shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                <span>Confirm & Execute Lifecycle Routing</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
