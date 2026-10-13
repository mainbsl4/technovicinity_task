'use client';

import React from 'react';
import {
  Factory,
  LayoutDashboard,
  Play,
  Layers,
  Boxes,
  PackageCheck,
  Trash2,
  History,
  BarChart3,
  Plus,
  RotateCcw,
  BoxesIcon,
  ShieldAlert
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { resetInventoryToSeed } from '@/lib/redux/slices/inventorySlice';
import { resetBOMsToSeed } from '@/lib/redux/slices/bomSlice';
import { resetOrdersToSeed } from '@/lib/redux/slices/productionSlice';

export type NavItem =
  | 'dashboard'
  | 'production'
  | 'bom'
  | 'raw_materials'
  | 'ready_products'
  | 'waste'
  | 'audit'
  | 'analytics';

interface SidebarProps {
  currentTab: NavItem;
  onSelectTab: (tab: NavItem) => void;
  onOpenNewOrder: () => void;
  onOpenRestock: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewOrder,
  onOpenRestock,
}) => {
  const dispatch = useAppDispatch();
  const rawMaterials = useAppSelector((state) => state.inventory.rawMaterials);
  const readyProducts = useAppSelector((state) => state.inventory.readyProducts);
  const boms = useAppSelector((state) => state.bom.boms);
  const wasteRecords = useAppSelector((state) => state.inventory.wasteRecords);
  const orders = useAppSelector((state) => state.production.orders);

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const activeOrdersCount = orders.filter((o) => o.status === 'IN_PROGRESS').length;
  const lowStockCount = rawMaterials.filter((m) => m.stockQuantity <= m.minThreshold).length;
  const pendingWasteCount = wasteRecords.filter((w) => w.status === 'LOGGED').length;
  const pendingBOMCount = readyProducts.filter(
    (p) => !boms.some((b) => b.productCode.toUpperCase() === p.code.toUpperCase())
  ).length;

  const handleResetData = () => {
    if (confirm('Reset all factory data (Inventory, BOMs, Orders, Waste) to default demo state?')) {
      dispatch(resetInventoryToSeed());
      dispatch(resetBOMsToSeed());
      dispatch(resetOrdersToSeed());
      localStorage.removeItem('vortex_mes_state_v1');
    }
  };

  const navGroups = [
    {
      title: 'OPERATIONS',
      items: [
        {
          id: 'dashboard' as NavItem,
          label: 'Dashboard',
          icon: LayoutDashboard,
        },
        {
          id: 'production' as NavItem,
          label: 'Production Orders',
          icon: Play,
          badge: mounted && activeOrdersCount > 0 ? activeOrdersCount : undefined,
          badgeColor: 'bg-amber-500/20 text-amber-400',
        },
        {
          id: 'bom' as NavItem,
          label: 'Bill of Materials',
          icon: Layers,
        },
      ],
    },
    {
      title: 'INVENTORY MODULES',
      items: [
        {
          id: 'raw_materials' as NavItem,
          label: 'Raw Materials',
          icon: Boxes,
          badge: mounted && lowStockCount > 0 ? `${lowStockCount} low` : undefined,
          badgeColor: 'bg-rose-500/20 text-rose-400',
        },
        {
          id: 'ready_products' as NavItem,
          label: 'Finished Products',
          icon: PackageCheck,
          badge: mounted && pendingBOMCount > 0 ? `${pendingBOMCount} need BOM` : undefined,
          badgeColor: 'bg-cyan-500/20 text-cyan-400',
        },
        {
          id: 'waste' as NavItem,
          label: 'Waste Management',
          icon: Trash2,
          badge: mounted && pendingWasteCount > 0 ? pendingWasteCount : undefined,
          badgeColor: 'bg-rose-500/20 text-rose-400',
        },
        {
          id: 'audit' as NavItem,
          label: 'Movement Logs',
          icon: History,
        },
      ],
    },
    {
      title: 'PERFORMANCE',
      items: [
        {
          id: 'analytics' as NavItem,
          label: 'Yield & Scrap Analytics',
          icon: BarChart3,
        },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col h-screen sticky top-0 flex-shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-zinc-950 shadow-md shadow-amber-500/10 font-black">
            <Factory className="w-5 h-5 text-black stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight text-base text-white font-mono">
                VORTEX<span className="text-amber-400">.MES</span>
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-medium">Production & Inventory</p>
          </div>
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="p-4 space-y-2 border-b border-zinc-800/80">
        <button
          onClick={onOpenNewOrder}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-md shadow-amber-500/15 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Production Run</span>
        </button>

        <button
          onClick={onOpenRestock}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold transition-all"
        >
          <BoxesIcon className="w-3.5 h-3.5 text-amber-400" />
          <span>Restock Raw Material</span>
        </button>
      </div>

      {/* Nav Menu */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <span className="px-3 text-[10px] font-bold text-zinc-400 tracking-wider">
              {group.title}
            </span>
            <div className="space-y-0.5 mt-1.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${isActive
                        ? 'bg-zinc-800 text-white font-bold'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-zinc-400'
                          }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${item.badgeColor || 'bg-zinc-800 text-zinc-300'
                          }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Footer Status & Reset */}
      <div className="p-3.5 border-t border-zinc-800/80 bg-zinc-950/70 space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-xs text-zinc-300 font-medium">Plant 01 • Active</span>
          </div>
          <button
            onClick={handleResetData}
            title="Reset system demo state"
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
