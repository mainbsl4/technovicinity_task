'use client';

import React from 'react';
import { useAppSelector } from '@/lib/redux/hooks';
import { 
  Factory, 
  Boxes, 
  PackageCheck, 
  Trash2, 
  Play, 
  AlertTriangle, 
  Layers, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { ProductionOrder } from '@/lib/types';

interface FactoryDashboardProps {
  onNavigateTab: (tab: 'dashboard' | 'production' | 'bom' | 'inventory') => void;
  onOpenNewOrder: () => void;
  onOpenRestock: () => void;
  onCompleteOrder: (order: ProductionOrder) => void;
}

export const FactoryDashboard: React.FC<FactoryDashboardProps> = ({
  onNavigateTab,
  onOpenNewOrder,
  onOpenRestock,
  onCompleteOrder,
}) => {
  const rawMaterials = useAppSelector((state) => state.inventory.rawMaterials);
  const readyProducts = useAppSelector((state) => state.inventory.readyProducts);
  const wasteRecords = useAppSelector((state) => state.inventory.wasteRecords);
  const auditLogs = useAppSelector((state) => state.inventory.auditLogs);
  const orders = useAppSelector((state) => state.production.orders);
  const boms = useAppSelector((state) => state.bom.boms);

  const activeOrders = orders.filter((o) => o.status === 'IN_PROGRESS');
  const stagedOrders = orders.filter((o) => o.status === 'STAGED');
  const completedOrders = orders.filter((o) => o.status === 'COMPLETED');

  const lowStockItems = rawMaterials.filter((m) => m.stockQuantity <= m.minThreshold);
  const totalFinishedStock = readyProducts.reduce((acc, p) => acc + p.stockQuantity, 0);
  const totalFinishedValue = readyProducts.reduce((acc, p) => acc + p.stockQuantity * p.unitValue, 0);

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Ready Products */}
        <div 
          onClick={() => onNavigateTab('inventory')}
          className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-emerald-500/40 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs uppercase font-bold tracking-wider">Ready Products</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold font-mono text-white tracking-tight">
              {totalFinishedStock} <span className="text-sm font-sans font-medium text-zinc-400">units</span>
            </span>
            <div className="text-xs text-emerald-400 font-mono mt-0.5">
              ${totalFinishedValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Valuation
            </div>
          </div>
        </div>

        {/* KPI 2: Raw Materials Health */}
        <div 
          onClick={() => onNavigateTab('inventory')}
          className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-amber-500/40 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs uppercase font-bold tracking-wider">Raw Material Health</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold font-mono text-white tracking-tight">
              {rawMaterials.length - lowStockItems.length} / {rawMaterials.length}
            </span>
            <div className="text-xs mt-0.5 flex items-center gap-1.5">
              {lowStockItems.length > 0 ? (
                <span className="text-rose-400 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {lowStockItems.length} Below Reorder Level
                </span>
              ) : (
                <span className="text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  All Materials Nominal
                </span>
              )}
            </div>
          </div>
        </div>

        {/* KPI 3: Shop Floor Orders */}
        <div 
          onClick={() => onNavigateTab('production')}
          className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-amber-500/40 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs uppercase font-bold tracking-wider">Manufacturing Runs</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play className="w-4 h-4 fill-current" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold font-mono text-white tracking-tight">
              {activeOrders.length} Running
            </span>
            <div className="text-xs text-zinc-400 mt-0.5">
              {stagedOrders.length} Staged • {completedOrders.length} Completed Runs
            </div>
          </div>
        </div>

        {/* KPI 4: Waste Management */}
        <div 
          onClick={() => onNavigateTab('inventory')}
          className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-rose-500/40 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs uppercase font-bold tracking-wider">Waste & Material Loss</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Trash2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold font-mono text-white tracking-tight">
              {wasteRecords.length} Entries
            </span>
            <div className="text-xs text-rose-400 mt-0.5">
              {wasteRecords.filter((w) => w.status === 'LOGGED').length} Pending Disposition
            </div>
          </div>
        </div>
      </div>

      {/* INDUSTRIAL LIFECYCLE FLOW VISUALIZATION */}
      <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Factory className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              Automated Manufacturing Lifecycle Pipeline
            </h2>
          </div>
          <span className="text-[11px] text-zinc-400 font-mono">
            State Machine: Ingestion → Recipe Cross-Check → Shop Floor → Automated Routing
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Step 1 */}
          <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 relative">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase mb-1">
              <Boxes className="w-4 h-4" />
              <span>1. Raw Materials</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Track stock levels, storage bins, and minimum thresholds with real-time intake restocks.
            </p>
            <div className="mt-2 font-mono text-xs text-zinc-300">
              {rawMaterials.length} Cataloged SKUs
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 relative">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase mb-1">
              <Layers className="w-4 h-4" />
              <span>2. BOM Recipes</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Define static product codes, raw material ratios, and tolerance waste % per component.
            </p>
            <div className="mt-2 font-mono text-xs text-zinc-300">
              {boms.length} Active Recipes
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 relative">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase mb-1">
              <Play className="w-4 h-4 fill-current" />
              <span>3. Work Orders</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Input target quantity. Engine auto-calculates base requirements and verifies stock availability.
            </p>
            <div className="mt-2 font-mono text-xs text-zinc-300">
              {orders.length} Managed Orders
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 relative">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase mb-1">
              <Sparkles className="w-4 h-4" />
              <span>4. Auto-Routing</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Credits Ready Products, deducts consumed RM, and forwards calculated waste to scrap ledger.
            </p>
            <div className="mt-2 font-mono text-xs text-zinc-300">
              Zero Manual Re-Entry
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Active Production Floor + Low Stock / Action Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Active Production Runs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Live Manufacturing Floor (Active Runs)
            </h3>
            <button
              onClick={() => onNavigateTab('production')}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
            >
              <span>View All Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {activeOrders.length === 0 ? (
            <div className="p-8 rounded-2xl bg-zinc-900/30 border border-zinc-800 text-center space-y-2">
              <p className="text-xs text-zinc-400">No active production runs running right now.</p>
              <button
                onClick={onOpenNewOrder}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold rounded-lg"
              >
                Launch Production Order
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {activeOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-400">
                        {order.orderNumber}
                      </span>
                      <strong className="text-sm text-white">{order.productName}</strong>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                        {order.line}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-400">
                      Batch: <strong className="font-mono text-zinc-200">{order.batchNumber}</strong> • Operator: {order.operator}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <div className="text-right">
                      <span className="text-[10px] text-zinc-500 block uppercase">Target</span>
                      <span className="font-mono font-bold text-white text-sm">
                        {order.targetQuantity} {order.uom}
                      </span>
                    </div>

                    <button
                      onClick={() => onCompleteOrder(order)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-zinc-950 font-bold text-xs rounded-lg shadow-sm transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Complete & Route</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recent Audit Ledger */}
          <div className="pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
              Recent Inventory Audit Events
            </h3>
            <div className="rounded-xl border border-zinc-800 overflow-hidden bg-zinc-900/30">
              <div className="divide-y divide-zinc-800/60 text-xs">
                {auditLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="p-3 flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-200">{log.itemName}</span>
                        <span className="font-mono text-[10px] text-amber-400">{log.referenceId}</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-1">{log.notes}</p>
                    </div>
                    <div className="text-right whitespace-nowrap">
                      <span
                        className={`font-mono font-bold text-xs ${
                          log.quantityChange > 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {log.quantityChange > 0 ? `+${log.quantityChange}` : log.quantityChange} {log.uom}
                      </span>
                      <span className="text-[10px] text-zinc-500 block font-mono">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Reorder Alerts & Quick Action Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Reorder Attention
            </h3>
            <button
              onClick={onOpenRestock}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
            >
              + Quick Restock
            </button>
          </div>

          <div className="space-y-3">
            {lowStockItems.length === 0 ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>All raw material stock levels are above safety thresholds.</span>
              </div>
            ) : (
              lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-bold text-rose-300 text-xs">{item.name}</div>
                    <div className="text-[11px] text-zinc-400 font-mono">
                      Current: <strong className="text-white">{item.stockQuantity} {item.uom}</strong> (Alert threshold: {item.minThreshold} {item.uom})
                    </div>
                  </div>
                  <button
                    onClick={onOpenRestock}
                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-md shadow-sm flex-shrink-0"
                  >
                    Restock
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Quick Stats Card */}
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
              Factory Quick Navigation
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <button
                onClick={() => onNavigateTab('production')}
                className="p-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-left transition-colors"
              >
                Shop Floor Runs →
              </button>
              <button
                onClick={() => onNavigateTab('bom')}
                className="p-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-left transition-colors"
              >
                BOM Studio →
              </button>
              <button
                onClick={() => onNavigateTab('inventory')}
                className="p-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-left transition-colors"
              >
                Raw Materials →
              </button>
              <button
                onClick={() => onNavigateTab('inventory')}
                className="p-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-left transition-colors"
              >
                Waste Ledger →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
