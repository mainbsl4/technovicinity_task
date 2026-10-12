'use client';

import React, { useState } from 'react';
import { AuditLog } from '@/lib/types';
import { 
  History, 
  ArrowUpRight, 
  ArrowDownRight, 
  Trash2, 
  PackagePlus, 
  Search, 
  Filter,
  CheckCircle2
} from 'lucide-react';

interface StockAuditTrailTableProps {
  logs: AuditLog[];
}

export const StockAuditTrailTable: React.FC<StockAuditTrailTableProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const filtered = logs.filter((log) => {
    const matchesSearch =
      log.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.referenceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.notes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'ALL' || log.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getTypeBadge = (type: AuditLog['type']) => {
    switch (type) {
      case 'PRODUCTION_OUTPUT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold text-[10px]">
            <ArrowUpRight className="w-3 h-3" />
            Finished Good Output
          </span>
        );
      case 'PRODUCTION_CONSUMPTION':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-semibold text-[10px]">
            <ArrowDownRight className="w-3 h-3" />
            Raw Material Consumed
          </span>
        );
      case 'WASTE_ROUTING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold text-[10px]">
            <Trash2 className="w-3 h-3" />
            Waste Routed
          </span>
        );
      case 'RESTOCK':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-semibold text-[10px]">
            <PackagePlus className="w-3 h-3" />
            Material Restock
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 font-semibold text-[10px]">
            Adjustment
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audit trail by item, order #, or keyword..."
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-100 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">Action Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 outline-none"
          >
            <option value="ALL">All Movements</option>
            <option value="PRODUCTION_OUTPUT">Finished Goods (+)</option>
            <option value="PRODUCTION_CONSUMPTION">Material Consumption (-)</option>
            <option value="WASTE_ROUTING">Waste Routing</option>
            <option value="RESTOCK">Restock / Intake</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-zinc-800 overflow-hidden bg-zinc-900/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/80 text-zinc-400 uppercase tracking-wider font-semibold text-[11px]">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Item & Code</th>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Quantity Change</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">System Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    No movement events found.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-800/30 transition-colors">
                    {/* Timestamp */}
                    <td className="py-3 px-4 font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleDateString()}{' '}
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>

                    {/* Type Badge */}
                    <td className="py-3 px-4">{getTypeBadge(log.type)}</td>

                    {/* Item */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-zinc-200">{log.itemName}</div>
                      <div className="font-mono text-[10px] text-zinc-500">{log.itemCode}</div>
                    </td>

                    {/* Reference */}
                    <td className="py-3 px-4 font-mono font-bold text-amber-400/90 whitespace-nowrap">
                      {log.referenceId}
                    </td>

                    {/* Quantity Change */}
                    <td className="py-3 px-4 font-mono font-bold whitespace-nowrap">
                      <span
                        className={
                          log.quantityChange > 0
                            ? 'text-emerald-400'
                            : log.quantityChange < 0
                            ? 'text-rose-400'
                            : 'text-zinc-300'
                        }
                      >
                        {log.quantityChange > 0 ? `+${log.quantityChange}` : log.quantityChange}{' '}
                        {log.uom}
                      </span>
                    </td>

                    {/* Actor */}
                    <td className="py-3 px-4 text-zinc-400 whitespace-nowrap">{log.actor}</td>

                    {/* Notes */}
                    <td className="py-3 px-4 text-zinc-400 max-w-sm">
                      <div className="line-clamp-2 text-[11px]">{log.notes}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
