'use client';

import React, { useState } from 'react';
import { useAppSelector } from '@/lib/redux/hooks';
import { Sidebar, NavItem } from '@/components/layout/Sidebar';
import { TopHeader } from '@/components/layout/TopHeader';
import { FinishedProductsCatalog } from '@/components/inventory/FinishedProductsCatalog';
import { BOMEditorDialog } from '@/components/bom/BOMEditorDialog';
import { NewProductionOrderDialog } from '@/components/production/NewProductionOrderDialog';
import { RestockDialog } from '@/components/inventory/RestockDialog';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

export default function ProductsPage() {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState<NavItem>('ready_products');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [isNewBOMOpen, setIsNewBOMOpen] = useState(false);
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [preselectedBOMId, setPreselectedBOMId] = useState<string | undefined>(undefined);
  const [preselectedBOMProductCode, setPreselectedBOMProductCode] = useState<string | undefined>(undefined);

  const boms = useAppSelector((state) => state.bom.boms);

  const handleSelectTab = (tab: NavItem) => {
    if (tab === 'ready_products') {
      setCurrentTab('ready_products');
    } else {
      router.push('/');
    }
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar
          currentTab="ready_products"
          onSelectTab={handleSelectTab}
          onOpenNewOrder={() => {
            setPreselectedBOMId(undefined);
            setIsNewOrderOpen(true);
          }}
          onOpenRestock={() => setIsRestockOpen(true)}
        />
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative z-10 flex">
            <Sidebar
              currentTab="ready_products"
              onSelectTab={(tab) => {
                handleSelectTab(tab);
                setIsMobileMenuOpen(false);
              }}
              onOpenNewOrder={() => {
                setPreselectedBOMId(undefined);
                setIsNewOrderOpen(true);
                setIsMobileMenuOpen(false);
              }}
              onOpenRestock={() => {
                setIsRestockOpen(true);
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <TopHeader
          currentTab="ready_products"
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenNewOrder={() => {
            setPreselectedBOMId(undefined);
            setIsNewOrderOpen(true);
          }}
          onOpenRestock={() => setIsRestockOpen(true)}
          onOpenNewBOM={() => {
            setPreselectedBOMProductCode(undefined);
            setIsNewBOMOpen(true);
          }}
        />

        <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
          <FinishedProductsCatalog
            onProduceMore={(code) => {
              const b = boms.find((x) => x.productCode.toUpperCase() === code.toUpperCase());
              setPreselectedBOMId(b?.id);
              setIsNewOrderOpen(true);
            }}
            onOpenNewBOMForProduct={(code) => {
              setPreselectedBOMProductCode(code);
              setIsNewBOMOpen(true);
            }}
            onOpenNewBOMGeneral={() => {
              setPreselectedBOMProductCode(undefined);
              setIsNewBOMOpen(true);
            }}
          />
        </main>
      </div>

      {/* Modals & Dialogs */}
      <NewProductionOrderDialog
        isOpen={isNewOrderOpen}
        onClose={() => setIsNewOrderOpen(false)}
        preselectedBOMId={preselectedBOMId}
        onQuickRestock={() => {
          setIsNewOrderOpen(false);
          setIsRestockOpen(true);
        }}
      />

      <BOMEditorDialog
        isOpen={isNewBOMOpen}
        onClose={() => {
          setIsNewBOMOpen(false);
          setPreselectedBOMProductCode(undefined);
        }}
        preselectedProductCode={preselectedBOMProductCode}
      />

      <RestockDialog
        isOpen={isRestockOpen}
        onClose={() => setIsRestockOpen(false)}
      />
    </div>
  );
}
