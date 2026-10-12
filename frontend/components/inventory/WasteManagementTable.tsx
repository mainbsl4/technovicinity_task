'use client';

import React, { useState } from 'react';
import { WasteRecord, WasteStatus } from '@/lib/types';
import { useAppDispatch } from '@/lib/redux/hooks';
import { updateWasteStatus } from '@/lib/redux/slices/inventorySlice';
import { 
  Trash2, 
  Recycle, 
  AlertCircle, 
  Search, 
  Filter, 
  CheckCircle,
  FileText,
  Clock,
  ArrowRight
} from 'lucide-react';

interface WasteManagementTableProps {
  wasteRecords: WasteRecord[];
}

export const WasteManagementTable: React.FC<WasteManagementTableProps> = ({
  wasteRecords,
}) => {
  const dispatch = useAppDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedRecordForAction, setSelectedRecordForAction] = useState<WasteRecord | null>(null);
  const [dispositionNotes, setDispositionNotes] = useState('');
  const [targetStatus, setTargetStatus] = useState<WasteStatus>('RECYCLED');

  const filtered = wasteRecords.filter((w) => {
    const matchesSearch =
      w.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.materialCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.productCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || w.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalLoggedWasteCount = wasteRecords.length;
  const pendingWasteCount = wasteRecords.filter((w) => w.status === 'LOGGED').length;
  const recycledCount = wasteRecords.filter((w) => w.status === 'RECYCLED').length;
  const disposedCount = wasteRecords.filter((w) => w.status === 'DISPOSED').length;

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecordForAction) return;

    dispatch(
      updateWasteStatus({
        wasteId: selectedRecordForAction.id,
        status: targetStatus,
        notes: dispositionNotes,
      })
    );

    setSelectedRecordForAction(null);
    setDispositionNotes('');
  };

  return (
    <div className="space-y-4">
      {/* Waste Metric Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-zinc-900/60 border border-zinc-800 p-3.5 rounded-xl">
          <span className="text-[11px] text-zinc-400 uppercase tracking-wider block">Total Waste Entries</span>
          <span className="text-xl font-bold font-mono text-white mt-1 block">{totalLoggedWasteCount} Batches</span>
        </div>
        <div className="bg-zinc-900/60 border border-zinc-800 p-3.5 rounded-xl">
          <span className="text-[11px] text-zinc-400 uppercase tracking-wider block">Pending Disposition</span>
          <span className="text-xl font-bold font-mono text-amber-400 mt-1 block">{pendingWasteCount} Pending</span>
        </div>
        <div className="bg-zinc-900/60 border border-zinc-800 p-3.5 rounded-xl">
          <span className="text-[11px] text-zinc-400 uppercase tracking-wider block">Recycled / Re-melted</span>
          <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">{recycledCount} Recycled</span>
        </div>
        <div className="bg-zinc-900/60 border border-zinc-800 p-3.5 rounded-xl">
          <span className="text-[11px] text-zinc-400 uppercase tracking-wider block">Neutralized / Disposed</span>
          <span className="text-xl font-bold font-mono text-rose-400 mt-1 block">{disposedCount} Disposed</span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by order #, material, SKU..."
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-100 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">Disposition Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 outline-none"
          >
            <option value="ALL">All Records</option>
            <option value="LOGGED">Pending (Logged)</option>
            <option value="RECYCLED">Recycled</option>
            <option value="DISPOSED">Disposed</option>
            <option value="SALVAGED">Salvaged</option>
          </select>
        </div>
      </div>

      {/* Waste Table */}
      <div className="rounded-xl border border-zinc-800 overflow-hidden bg-zinc-900/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/80 text-zinc-400 uppercase tracking-wider font-semibold text-[11px]">
                <th className="py-3 px-4">Source Order</th>
                <th className="py-3 px-4">Material Lost / Waste</th>
                <th className="py-3 px-4">BOM Waste %</th>
                <th className="py-3 px-4">Loss Quantity</th>
                <th className="py-3 px-4">Reason / Lifecycle Note</th>
                <th className="py-3 px-4">Disposition Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    No waste records match criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((record) => (
                  <tr key={record.id} className="hover:bg-zinc-800/30 transition-colors">
                    {/* Order Reference */}
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-amber-400">{record.orderNumber}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">{record.productCode}</div>
                    </td>

                    {/* Material */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-zinc-200">{record.materialName}</div>
                      <div className="font-mono text-[10px] text-zinc-400">{record.materialCode}</div>
                    </td>

                    {/* BOM Waste % */}
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-zinc-300 px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700">
                        {record.wastePercentage}%
                      </span>
                    </td>

                    {/* Loss Quantity */}
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-sm text-rose-400">
                        +{record.wasteQuantity} {record.uom}
                      </div>
                    </td>

                    {/* Reason */}
                    <td className="py-3 px-4 text-zinc-400 max-w-xs">
                      <div className="line-clamp-2 text-[11px]">{record.reason}</div>
                      {record.dispositionNotes && (
                        <div className="text-[10px] text-emerald-400/90 mt-0.5 line-clamp-1 italic">
                          ↳ {record.dispositionNotes}
                        </div>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4">
                      {record.status === 'LOGGED' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-medium text-[10px]">
                          <Clock className="w-2.5 h-2.5" />
                          Pending Action
                        </span>
                      )}
                      {record.status === 'RECYCLED' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-medium text-[10px]">
                          <Recycle className="w-2.5 h-2.5" />
                          Recycled
                        </span>
                      )}
                      {record.status === 'DISPOSED' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-medium text-[10px]">
                          <Trash2 className="w-2.5 h-2.5" />
                          Disposed
                        </span>
                      )}
                      {record.status === 'SALVAGED' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-medium text-[10px]">
                          <CheckCircle className="w-2.5 h-2.5" />
                          Salvaged
                        </span>
                      )}
                    </td>

                    {/* Action button */}
                    <td className="py-3 px-4 text-right">
                      {record.status === 'LOGGED' ? (
                        <button
                          onClick={() => {
                            setSelectedRecordForAction(record);
                            setTargetStatus('RECYCLED');
                          }}
                          className="px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-colors"
                        >
                          Process Waste
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedRecordForAction(record);
                            setTargetStatus(record.status);
                            setDispositionNotes(record.dispositionNotes || '');
                          }}
                          className="text-[11px] text-zinc-500 hover:text-zinc-300 underline"
                        >
                          Edit Note
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disposition Modal */}
      {selectedRecordForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-6 relative">
            <h3 className="text-base font-bold text-white mb-1">
              Process Scrap / Waste Batch
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Order {selectedRecordForAction.orderNumber} • {selectedRecordForAction.materialName} ({selectedRecordForAction.wasteQuantity} {selectedRecordForAction.uom})
            </p>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Disposition Action
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetStatus('RECYCLED')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border text-center transition-all ${
                      targetStatus === 'RECYCLED'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    Recycle
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetStatus('DISPOSED')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border text-center transition-all ${
                      targetStatus === 'DISPOSED'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    Dispose
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetStatus('SALVAGED')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border text-center transition-all ${
                      targetStatus === 'SALVAGED'
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    Salvage
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Disposition Notes / Recycling Reference
                </label>
                <textarea
                  rows={3}
                  value={dispositionNotes}
                  onChange={(e) => setDispositionNotes(e.target.value)}
                  placeholder="e.g. Dispatched to secondary smelting recycler batch #78"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-lg p-2.5 text-xs text-zinc-100 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRecordForAction(null)}
                  className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-lg shadow-sm"
                >
                  Save Disposition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
