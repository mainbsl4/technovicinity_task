'use client';

import React, { useState } from 'react';
import { useAppSelector } from '@/lib/redux/hooks';
import { Sidebar, NavItem } from '@/components/layout/Sidebar';
import { TopHeader } from '@/components/layout/TopHeader';
import { FactoryDashboard } from '@/components/dashboard/FactoryDashboard';
import { ProductionHub } from '@/components/production/ProductionHub';
import { BOMHub } from '@/components/bom/BOMHub';
import { RawMaterialsTable } from '@/components/inventory/RawMaterialsTable';
import { ReadyProductsTable } from '@/components/inventory/ReadyProductsTable';
import { WasteManagementTable } from '@/components/inventory/WasteManagementTable';
import { StockAuditTrailTable } from '@/components/inventory/StockAuditTrailTable';
import { AnalyticsHub } from '@/components/analytics/AnalyticsHub';

import { RestockDialog } from '@/components/inventory/RestockDialog';
import { NewRawMaterialDialog } from '@/components/inventory/NewRawMaterialDialog';
import { BOMEditorDialog } from '@/components/bom/BOMEditorDialog';
import { NewProductionOrderDialog } from '@/components/production/NewProductionOrderDialog';
import { OrderCompletionModal } from '@/components/production/OrderCompletionModal';
import { ProductionOrder } from '@/lib/types';
import { X } from 'lucide-react';

export default function Home() {
  const [currentTab, setCurrentTab] = useState<NavItem>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modal dialog states
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [isNewBOMOpen, setIsNewBOMOpen] = useState(false);
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [isNewMaterialOpen, setIsNewMaterialOpen] = useState(false);
  const [preselectedRestockId, setPreselectedRestockId] = useState<string | undefined>(undefined);
  const [preselectedBOMId, setPreselectedBOMId] = useState<string | undefined>(undefined);
  const [completingOrder, setCompletingOrder] = useState<ProductionOrder | null>(null);

  // Redux state
  const rawMaterials = useAppSelector((state) => state.inventory.rawMaterials);
  const readyProducts = useAppSelector((state) => state.inventory.readyProducts);
  const wasteRecords = useAppSelector((state) => state.inventory.wasteRecords);
  const auditLogs = useAppSelector((state) => state.inventory.auditLogs);

  const handleOpenRestock = (materialId?: string) => {
    setPreselectedRestockId(materialId);
    setIsRestockOpen(true);
  };

  const handleProduceFromBOM = (bomId: string) => {
    setPreselectedBOMId(bomId);
    setIsNewOrderOpen(true);
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          onOpenNewOrder={() => {
            setPreselectedBOMId(undefined);
            setIsNewOrderOpen(true);
          }}
          onOpenRestock={() => handleOpenRestock()}
        />
      </div>

      {/* Mobile Drawer Sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative z-10 flex">
            <Sidebar
              currentTab={currentTab}
              onSelectTab={(tab) => {
                setCurrentTab(tab);
                setIsMobileMenuOpen(false);
              }}
              onOpenNewOrder={() => {
                setPreselectedBOMId(undefined);
                setIsNewOrderOpen(true);
                setIsMobileMenuOpen(false);
              }}
              onOpenRestock={() => {
                handleOpenRestock();
                setIsMobileMenuOpen(false);
              }}
            />
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-white h-fit mt-3 ml-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <TopHeader
          currentTab={currentTab}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenNewOrder={() => {
            setPreselectedBOMId(undefined);
            setIsNewOrderOpen(true);
          }}
          onOpenRestock={() => handleOpenRestock()}
          onOpenNewBOM={() => setIsNewBOMOpen(true)}
        />

        <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* 1. Dashboard */}
          {currentTab === 'dashboard' && (
            <FactoryDashboard
              onNavigateTab={(tab) => {
                if (tab === 'dashboard') setCurrentTab('dashboard');
                else if (tab === 'production') setCurrentTab('production');
                else if (tab === 'bom') setCurrentTab('bom');
                else if (tab === 'inventory') setCurrentTab('raw_materials');
              }}
              onOpenNewOrder={() => {
                setPreselectedBOMId(undefined);
                setIsNewOrderOpen(true);
              }}
              onOpenRestock={() => handleOpenRestock()}
              onCompleteOrder={(order) => setCompletingOrder(order)}
            />
          )}

          {/* 2. Production Orders */}
          {currentTab === 'production' && (
            <ProductionHub
              onOpenNewOrder={() => {
                setPreselectedBOMId(undefined);
                setIsNewOrderOpen(true);
              }}
              onProduceFromBOM={handleProduceFromBOM}
            />
          )}

          {/* 3. Bill of Materials (BOM) */}
          {currentTab === 'bom' && (
            <BOMHub
              onProduceFromBOM={handleProduceFromBOM}
              onOpenNewBOM={() => setIsNewBOMOpen(true)}
            />
          )}

          {/* 4. Raw Materials Inventory */}
          {currentTab === 'raw_materials' && (
            <RawMaterialsTable
              materials={rawMaterials}
              onRestock={(id) => handleOpenRestock(id)}
              onOpenNewMaterial={() => setIsNewMaterialOpen(true)}
            />
          )}

          {/* 5. Ready Products (Finished Goods) */}
          {currentTab === 'ready_products' && (
            <ReadyProductsTable
              products={readyProducts}
              onProduceMore={() => setIsNewOrderOpen(true)}
            />
          )}

          {/* 6. Waste Management */}
          {currentTab === 'waste' && (
            <WasteManagementTable wasteRecords={wasteRecords} />
          )}

          {/* 7. Stock Movement Audit Trail */}
          {currentTab === 'audit' && (
            <StockAuditTrailTable logs={auditLogs} />
          )}

          {/* 8. Analytics */}
          {currentTab === 'analytics' && <AnalyticsHub />}
        </main>
      </div>

      {/* Modals & Dialogs */}
      <NewProductionOrderDialog
        isOpen={isNewOrderOpen}
        onClose={() => setIsNewOrderOpen(false)}
        preselectedBOMId={preselectedBOMId}
        onQuickRestock={(matId) => {
          setIsNewOrderOpen(false);
          handleOpenRestock(matId);
        }}
      />

      <BOMEditorDialog
        isOpen={isNewBOMOpen}
        onClose={() => setIsNewBOMOpen(false)}
      />

      <RestockDialog
        isOpen={isRestockOpen}
        onClose={() => {
          setIsRestockOpen(false);
          setPreselectedRestockId(undefined);
        }}
        preselectedMaterialId={preselectedRestockId}
      />

      <NewRawMaterialDialog
        isOpen={isNewMaterialOpen}
        onClose={() => setIsNewMaterialOpen(false)}
      />

      {completingOrder && (
        <OrderCompletionModal
          order={completingOrder}
          isOpen={!!completingOrder}
          onClose={() => setCompletingOrder(null)}
        />
      )}
    </div>
  );
}
