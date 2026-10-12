'use client';

import React from 'react';
import { 
  Menu, 
  Plus, 
  Boxes, 
  RotateCcw, 
  ShieldAlert, 
  Sparkles,
  Layers
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { NavItem } from './Sidebar';

interface TopHeaderProps {
  currentTab: NavItem;
  onOpenMobileMenu?: () => void;
  onOpenNewOrder: () => void;
  onOpenRestock: () => void;
  onOpenNewBOM: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentTab,
  onOpenMobileMenu,
  onOpenNewOrder,
  onOpenRestock,
  onOpenNewBOM,
}) => {
  const rawMaterials = useAppSelector((state) => state.inventory.rawMaterials);
  const lowStockCount = rawMaterials.filter((m) => m.stockQuantity <= m.minThreshold).length;

  const titles: Record<NavItem, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Plant Dashboard',
      subtitle: 'Real-time overview of manufacturing orders, inventories, and material yields',
    },
    production: {
      title: 'Production Orders',
      subtitle: 'Schedule, track, and complete shop-floor manufacturing work orders',
    },
    bom: {
      title: 'Bill of Materials (BOM)',
      subtitle: 'Recipes defining component quantities, units of measure, and scrap allowances',
    },
    raw_materials: {
      title: 'Raw Materials Inventory',
      subtitle: 'Catalog, stock thresholds, bin locations, and inventory intake replenishment',
    },
    ready_products: {
      title: 'Ready Products (Finished Goods)',
      subtitle: 'Completed inventory automatically credited upon production order confirmation',
    },
    waste: {
      title: 'Waste Management',
      subtitle: 'Material scrap ledger automatically calculated from BOM predefined waste percentages',
    },
    audit: {
      title: 'Stock Movement Logs',
      subtitle: 'Complete immutable audit trail of consumption, output, waste, and restocks',
    },
    analytics: {
      title: 'Yield & Scrap Analytics',
      subtitle: 'Manufacturing efficiency, scrap distribution, and recycling breakdown',
    },
  };

  const currentInfo = titles[currentTab] || titles.dashboard;

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur px-6 py-4 flex items-center justify-between gap-4 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">{currentInfo.title}</h1>
          <p className="text-xs text-zinc-400 hidden sm:block">{currentInfo.subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {lowStockCount > 0 && (
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{lowStockCount} raw material{lowStockCount > 1 ? 's' : ''} low</span>
          </div>
        )}

        <button
          onClick={onOpenRestock}
          className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 hover:text-white transition-all"
        >
          <Boxes className="w-3.5 h-3.5 text-amber-400" />
          <span>Restock RM</span>
        </button>

        <button
          onClick={onOpenNewBOM}
          className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 hover:text-white transition-all"
        >
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>New BOM</span>
        </button>

        <button
          onClick={onOpenNewOrder}
          className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-all shadow-md shadow-amber-500/15"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Order</span>
        </button>
      </div>
    </header>
  );
};
