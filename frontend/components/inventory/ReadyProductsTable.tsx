'use client';

import React, { useState } from 'react';
import { ReadyProduct } from '@/lib/types';
import { PackageCheck, Search, Play, Calendar, DollarSign, Sparkles } from 'lucide-react';

interface ReadyProductsTableProps {
  products: ReadyProduct[];
  onProduceMore: (productCode: string) => void;
}

export const ReadyProductsTable: React.FC<ReadyProductsTableProps> = ({
  products,
  onProduceMore,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalInventoryValue = products.reduce(
    (acc, p) => acc + p.stockQuantity * p.unitValue,
    0
  );

  return (
    <div className="space-y-4">
      {/* Header Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-zinc-900/60 border border-zinc-800 p-3.5 rounded-xl">
          <span className="text-[11px] text-zinc-400 uppercase tracking-wider block">Ready Product SKUs</span>
          <span className="text-xl font-bold font-mono text-white mt-1 block">{products.length} Models</span>
        </div>
        <div className="bg-zinc-900/60 border border-zinc-800 p-3.5 rounded-xl">
          <span className="text-[11px] text-zinc-400 uppercase tracking-wider block">Finished Units In Stock</span>
          <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">
            {products.reduce((acc, p) => acc + p.stockQuantity, 0)} Units
          </span>
        </div>
        <div className="bg-zinc-900/60 border border-zinc-800 p-3.5 rounded-xl">
          <span className="text-[11px] text-zinc-400 uppercase tracking-wider block">Total Finished Goods Value</span>
          <span className="text-xl font-bold font-mono text-amber-400 mt-1 block">
            ${totalInventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center justify-between gap-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search finished goods by code or product name..."
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-100 outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-zinc-800 overflow-hidden bg-zinc-900/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/80 text-zinc-400 uppercase tracking-wider font-semibold text-[11px]">
                <th className="py-3 px-4">Finished Product</th>
                <th className="py-3 px-4">Static SKU</th>
                <th className="py-3 px-4">Ready Stock</th>
                <th className="py-3 px-4">Unit Value</th>
                <th className="py-3 px-4">Total Produced</th>
                <th className="py-3 px-4">Last Manufacturing Run</th>
                <th className="py-3 px-4 text-right">Shop Floor Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    No finished ready products found.
                  </td>
                </tr>
              ) : (
                filtered.map((prod) => (
                  <tr key={prod.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-zinc-100">{prod.name}</div>
                      <div className="text-[11px] text-zinc-400 line-clamp-1">{prod.description}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-cyan-400 font-bold">
                        {prod.code}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <PackageCheck className="w-4 h-4 text-emerald-400" />
                        <span className="font-mono font-bold text-sm text-white">
                          {prod.stockQuantity}
                        </span>
                        <span className="text-zinc-400 font-mono">{prod.uom}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-zinc-200">
                      ${prod.unitValue.toFixed(2)}
                    </td>

                    <td className="py-3 px-4 font-mono text-zinc-400">
                      {prod.totalProduced} units
                    </td>

                    <td className="py-3 px-4 text-zinc-400">
                      {prod.lastProducedAt ? (
                        <span title={prod.lastProducedAt}>
                          {new Date(prod.lastProducedAt).toLocaleDateString()} {new Date(prod.lastProducedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onProduceMore(prod.code)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-sm transition-all"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Produce Batch</span>
                      </button>
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
