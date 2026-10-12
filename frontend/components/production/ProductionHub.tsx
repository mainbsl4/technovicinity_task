'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { ProductionOrder, ProductionOrderStatus } from '@/lib/types';
import { updateOrderStatus, cancelProductionOrder } from '@/lib/redux/slices/productionSlice';
import { OrderCompletionModal } from './OrderCompletionModal';
import { 
  Play, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Search, 
  Layers, 
  User, 
  Calendar, 
  AlertCircle,
  XCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface ProductionHubProps {
  onOpenNewOrder: () => void;
  onProduceFromBOM: (bomId: string) => void;
}

export const ProductionHub: React.FC<ProductionHubProps> = ({
  onOpenNewOrder,
}) => {
  const dispatch = useAppDispatch();
  const orders = useAppSelector((state) => state.production.orders);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [completingOrder, setCompletingOrder] = useState<ProductionOrder | null>(null);

  const filtered = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.operator.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: ProductionOrderStatus) => {
    switch (status) {
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            In Progress (Running)
          </span>
        );
      case 'STAGED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-medium text-xs">
            <Clock className="w-3 h-3" />
            Staged
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs">
            <CheckCircle2 className="w-3 h-3" />
            Completed & Routed
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 font-medium text-xs">
            Draft
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-medium text-xs">
            <XCircle className="w-3 h-3" />
            Cancelled
          </span>
        );
    }
  };

  const handleStartRun = (orderId: string) => {
    dispatch(updateOrderStatus({ orderId, status: 'IN_PROGRESS' }));
  };

  const handleCancel = (orderId: string) => {
    if (confirm('Cancel this manufacturing work order?')) {
      dispatch(cancelProductionOrder({ orderId, reason: 'Operator aborted order' }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with Filter and Action */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search order #, product, batch, or operator..."
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-100 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 outline-none"
          >
            <option value="ALL">All Statuses ({orders.length})</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="STAGED">Staged</option>
            <option value="COMPLETED">Completed</option>
            <option value="DRAFT">Draft</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <button
            onClick={onOpenNewOrder}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs rounded-lg shadow-md shadow-amber-500/20 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Work Order</span>
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.length === 0 ? (
          <div className="py-16 text-center border border-zinc-800 rounded-2xl bg-zinc-900/40 text-zinc-500 text-sm">
            No production work orders match your filter.
          </div>
        ) : (
          filtered.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 transition-all p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              {/* Order Info */}
              <div className="flex items-start gap-4 flex-1">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-sm flex-shrink-0 border ${
                    order.status === 'IN_PROGRESS'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      : order.status === 'COMPLETED'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                  }`}
                >
                  <Play className={`w-5 h-5 ${order.status === 'IN_PROGRESS' ? 'fill-current' : ''}`} />
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400">
                      {order.orderNumber}
                    </span>
                    <span className="font-bold text-white text-base">
                      {order.productName}
                    </span>
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400">
                      {order.productCode}
                    </span>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-500 font-mono">BATCH:</span>
                      <strong className="text-zinc-200 font-mono">{order.batchNumber}</strong>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-500">LINE:</span>
                      <strong className="text-zinc-200">{order.line}</strong>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{order.operator}</span>
                    </div>
                  </div>

                  {order.notes && (
                    <p className="text-[11px] text-zinc-400 italic pt-0.5">
                      Note: {order.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Quantity Target & Actions */}
              <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-end border-t md:border-t-0 border-zinc-800 pt-3 md:pt-0">
                <div className="text-right px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Target Output</span>
                  <span className="font-mono text-base font-bold text-white">
                    {order.targetQuantity} {order.uom}
                  </span>
                </div>

                {order.status === 'IN_PROGRESS' && (
                  <button
                    onClick={() => setCompletingOrder(order)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-zinc-950 font-bold text-xs rounded-lg shadow-md shadow-emerald-500/20 transition-all active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                    <span>Complete & Route Lifecycle</span>
                  </button>
                )}

                {(order.status === 'STAGED' || order.status === 'DRAFT') && (
                  <button
                    onClick={() => handleStartRun(order.id)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-lg shadow-sm transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start Run</span>
                  </button>
                )}

                {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                  <button
                    onClick={() => handleCancel(order.id)}
                    className="p-2 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 text-xs transition-colors"
                    title="Cancel Order"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Completion Modal with Automated Lifecycle Routing */}
      {completingOrder && (
        <OrderCompletionModal
          order={completingOrder}
          isOpen={!!completingOrder}
          onClose={() => setCompletingOrder(null)}
        />
      )}
    </div>
  );
};
