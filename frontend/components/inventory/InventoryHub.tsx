'use client';

import React, { useState } from 'react';
import { useAppSelector } from '@/lib/redux/hooks';
import { RawMaterialsTable } from './RawMaterialsTable';
import { ReadyProductsTable } from './ReadyProductsTable';
import { WasteManagementTable } from './WasteManagementTable';
import { StockAuditTrailTable } from './StockAuditTrailTable';
import { 
  Boxes, 
  PackageCheck, 
  Trash2, 
  History,
  AlertTriangle
} from 'lucide-react';

interface InventoryHubProps {
  onRestock: (materialId?: string) => void;
  onOpenNewMaterial: () => void;
  onProduceMore: (productCode: string) => void;
  initialTab?: 'raw' | 'ready' | 'waste' | 'audit';
}

export const InventoryHub: React.FC<InventoryHubProps> = ({
  onRestock,
  onOpenNewMaterial,
  onProduceMore,
  initialTab = 'raw',
}) => {
  const [activeTab, setActiveTab] = useState<'raw' | 'ready' | 'waste' | 'audit'>(initialTab);

  const rawMaterials = useAppSelector((state) => state.inventory.rawMaterials);
  const readyProducts = useAppSelector((state) => state.inventory.readyProducts);
  const wasteRecords = useAppSelector((state) => state.inventory.wasteRecords);
  const auditLogs = useAppSelector((state) => state.inventory.auditLogs);

  const lowStockCount = rawMaterials.filter((m) => m.stockQuantity <= m.minThreshold).length;
  const pendingWasteCount = wasteRecords.filter((w) => w.status === 'LOGGED').length;

  return (
    <div className="space-y-6">
      {/* Subtab Navigation */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-zinc-900/80 rounded-xl border border-zinc-800">
        {/* Raw Materials Tab */}
        <button
          onClick={() => setActiveTab('raw')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'raw'
              ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Raw Materials</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              activeTab === 'raw'
                ? 'bg-zinc-950/20 text-zinc-950'
                : 'bg-zinc-800 text-zinc-300'
            }`}
          >
            {rawMaterials.length}
          </span>
          {lowStockCount > 0 && (
            <span
              title={`${lowStockCount} items at low stock`}
              className={`w-2 h-2 rounded-full ${
                activeTab === 'raw' ? 'bg-rose-950' : 'bg-rose-500 animate-pulse'
              }`}
            />
          )}
        </button>

        {/* Ready Products Tab */}
        <button
          onClick={() => setActiveTab('ready')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'ready'
              ? 'bg-cyan-500 text-zinc-950 shadow-md shadow-cyan-500/20'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          }`}
        >
          <PackageCheck className="w-4 h-4" />
          <span>Ready Products (Finished Goods)</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              activeTab === 'ready'
                ? 'bg-zinc-950/20 text-zinc-950'
                : 'bg-zinc-800 text-zinc-300'
            }`}
          >
            {readyProducts.length}
          </span>
        </button>

        {/* Waste Management Tab */}
        <button
          onClick={() => setActiveTab('waste')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'waste'
              ? 'bg-rose-500 text-zinc-950 shadow-md shadow-rose-500/20'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          }`}
        >
          <Trash2 className="w-4 h-4" />
          <span>Waste Management</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              activeTab === 'waste'
                ? 'bg-zinc-950/20 text-zinc-950'
                : 'bg-zinc-800 text-zinc-300'
            }`}
          >
            {wasteRecords.length}
          </span>
          {pendingWasteCount > 0 && (
            <span
              title={`${pendingWasteCount} pending waste entries`}
              className={`px-1.5 py-0.2 rounded text-[10px] ${
                activeTab === 'waste'
                  ? 'bg-rose-950 text-white font-mono'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono'
              }`}
            >
              {pendingWasteCount} new
            </span>
          )}
        </button>

        {/* Audit Trail Tab */}
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'audit'
              ? 'bg-zinc-100 text-zinc-950 shadow-md shadow-zinc-100/10'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Stock Audit Trail</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              activeTab === 'audit'
                ? 'bg-zinc-950/20 text-zinc-950'
                : 'bg-zinc-800 text-zinc-300'
            }`}
          >
            {auditLogs.length}
          </span>
        </button>
      </div>

      {/* Active Tab View */}
      {activeTab === 'raw' && (
        <RawMaterialsTable
          materials={rawMaterials}
          onRestock={(id) => onRestock(id)}
          onOpenNewMaterial={onOpenNewMaterial}
        />
      )}

      {activeTab === 'ready' && (
        <ReadyProductsTable
          products={readyProducts}
          onProduceMore={onProduceMore}
        />
      )}

      {activeTab === 'waste' && (
        <WasteManagementTable wasteRecords={wasteRecords} />
      )}

      {activeTab === 'audit' && (
        <StockAuditTrailTable logs={auditLogs} />
      )}
    </div>
  );
};
