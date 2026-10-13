'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { ReadyProduct, UnitOfMeasure } from '@/lib/types';
import { addNewReadyProduct } from '@/lib/redux/slices/inventorySlice';
import { 
  PackageCheck, 
  Search, 
  Play, 
  Plus, 
  Layers, 
  Tag, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  Sparkles, 
  ExternalLink,
  X,
  Filter
} from 'lucide-react';

interface FinishedProductsCatalogProps {
  onProduceMore: (productCode: string) => void;
  onOpenNewBOMForProduct: (productCode: string) => void;
  onOpenNewBOMGeneral: () => void;
}

// SKU generator for the Add Product modal
const generateSKUFromName = (name: string): string => {
  if (!name || !name.trim()) {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    return `FG-PROD-${randomSuffix}`;
  }

  const cleanWords = name
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (cleanWords.length === 0) {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    return `FG-PROD-${randomSuffix}`;
  }

  const slug = cleanWords
    .slice(0, 3)
    .map((w) => w.toUpperCase().slice(0, 6))
    .join('-');

  return `FG-${slug}`;
};

export const FinishedProductsCatalog: React.FC<FinishedProductsCatalogProps> = ({
  onProduceMore,
  onOpenNewBOMForProduct,
  onOpenNewBOMGeneral,
}) => {
  const dispatch = useAppDispatch();
  const products = useAppSelector((state) => state.inventory.readyProducts);
  const boms = useAppSelector((state) => state.bom.boms);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'needs_bom' | 'has_bom'>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // New Product Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductCode, setNewProductCode] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('Industrial Robotics');
  const [newUom, setNewUom] = useState<UnitOfMeasure>('pcs');
  const [newUnitValue, setNewUnitValue] = useState<string>('199.00');
  const [autoOpenBOM, setAutoOpenBOM] = useState(true);
  const [isSkuEdited, setIsSkuEdited] = useState(false);

  // Map BOM recipes by product code
  const bomByProductCode = React.useMemo(() => {
    const map = new Map<string, typeof boms[0]>();
    boms.forEach((b) => {
      map.set(b.productCode.toUpperCase(), b);
    });
    return map;
  }, [boms]);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleOpenAddModal = () => {
    setNewProductName('');
    setNewProductCode(generateSKUFromName(''));
    setNewDescription('');
    setNewCategory('Industrial Robotics');
    setNewUom('pcs');
    setNewUnitValue('199.00');
    setAutoOpenBOM(true);
    setIsSkuEdited(false);
    setIsAddModalOpen(true);
  };

  const handleSaveNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim() || !newProductCode.trim()) return;

    const trimmedCode = newProductCode.trim().toUpperCase();
    const trimmedName = newProductName.trim();

    dispatch(
      addNewReadyProduct({
        code: trimmedCode,
        name: trimmedName,
        description: newDescription.trim() || `Finished product model ${trimmedName}`,
        stockQuantity: 0,
        uom: newUom,
        unitValue: parseFloat(newUnitValue) || 100.0,
        bomId: '',
        category: newCategory,
      })
    );

    setIsAddModalOpen(false);

    if (autoOpenBOM) {
      setTimeout(() => {
        onOpenNewBOMForProduct(trimmedCode);
      }, 100);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());

    const hasBOM = bomByProductCode.has(p.code.toUpperCase());

    if (!matchesSearch) return false;
    if (filterType === 'needs_bom') return !hasBOM;
    if (filterType === 'has_bom') return hasBOM;
    return true;
  });

  const productsWithBOMCount = products.filter((p) => bomByProductCode.has(p.code.toUpperCase())).length;
  const productsWithoutBOMCount = products.length - productsWithBOMCount;
  const totalStock = products.reduce((acc, p) => acc + p.stockQuantity, 0);
  const totalValue = products.reduce((acc, p) => acc + p.stockQuantity * p.unitValue, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner & Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Total Product Models</span>
            <Tag className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-2">{products.length} Models</div>
          <span className="text-[11px] text-zinc-500 mt-0.5 block">Catalog Product SKUs</span>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Active BOM Recipes</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">{productsWithBOMCount} Linked</div>
          <span className="text-[11px] text-zinc-500 mt-0.5 block">Configured for manufacturing</span>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Awaiting BOM Recipe</span>
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-2">{productsWithoutBOMCount} Pending</div>
          <span className="text-[11px] text-zinc-500 mt-0.5 block">Need BOM definition</span>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Finished Goods Stock</span>
            <PackageCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-2">{totalStock} Units</div>
          <span className="text-[11px] text-zinc-500 mt-0.5 block font-mono">
            ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Action Bar: Search, Filters & Add Product */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 max-w-2xl">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Product Name or Product SKU / Code..."
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-100 outline-none"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                filterType === 'all'
                  ? 'bg-zinc-800 text-white font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              All ({products.length})
            </button>
            <button
              onClick={() => setFilterType('needs_bom')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1 ${
                filterType === 'needs_bom'
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>Needs BOM</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/30 text-amber-200 font-mono">
                {productsWithoutBOMCount}
              </span>
            </button>
            <button
              onClick={() => setFilterType('has_bom')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1 ${
                filterType === 'has_bom'
                  ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>Has BOM</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/30 text-emerald-200 font-mono">
                {productsWithBOMCount}
              </span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs rounded-lg border border-zinc-700 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>New Product</span>
          </button>

          <button
            onClick={onOpenNewBOMGeneral}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs rounded-lg shadow-md shadow-cyan-500/20 transition-all"
          >
            <Layers className="w-4 h-4 stroke-[2.5]" />
            <span>Create BOM</span>
          </button>
        </div>
      </div>

      {/* Finished Products Directory Table */}
      <div className="rounded-xl border border-zinc-800 overflow-hidden bg-zinc-900/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/80 text-zinc-400 uppercase tracking-wider font-semibold text-[11px]">
                <th className="py-3 px-4">Finished Product Name</th>
                <th className="py-3 px-4">Product SKU / Code</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">BOM Recipe Status</th>
                <th className="py-3 px-4">Warehouse Stock</th>
                <th className="py-3 px-4">Unit Value</th>
                <th className="py-3 px-4 text-right">Shop Floor Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-zinc-500">
                    No products found matching &ldquo;{searchTerm}&rdquo;.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const linkedBOM = bomByProductCode.get(prod.code.toUpperCase());
                  const isCopied = copiedCode === prod.code;

                  return (
                    <tr key={prod.id} className="hover:bg-zinc-800/30 transition-colors">
                      {/* Product Name & Description */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-zinc-100 text-sm">{prod.name}</div>
                        <div className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                          {prod.description}
                        </div>
                      </td>

                      {/* Product SKU / Code */}
                      <td className="py-3 px-4">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-950 border border-zinc-800">
                          <span className="font-mono text-xs font-bold text-cyan-400 tracking-wider">
                            {prod.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(prod.code)}
                            title="Copy SKU to clipboard"
                            className="p-0.5 rounded text-zinc-400 hover:text-white transition-colors"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-medium">
                          {prod.category}
                        </span>
                      </td>

                      {/* BOM Recipe Status */}
                      <td className="py-3 px-4">
                        {linkedBOM ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>BOM Active (v{linkedBOM.version})</span>
                            </span>
                            <span className="text-[11px] font-mono text-zinc-400">
                              ${linkedBOM.estimatedUnitCost.toFixed(2)} cost
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-400">
                              <AlertCircle className="w-3 h-3" />
                              <span>No BOM Configured</span>
                            </span>
                            <button
                              onClick={() => onOpenNewBOMForProduct(prod.code)}
                              className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors"
                            >
                              + Create BOM
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Warehouse Stock */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-mono font-bold text-xs ${prod.stockQuantity > 0 ? 'text-white' : 'text-zinc-500'}`}>
                            {prod.stockQuantity}
                          </span>
                          <span className="text-zinc-400 font-mono text-[11px]">{prod.uom}</span>
                        </div>
                      </td>

                      {/* Unit Value */}
                      <td className="py-3 px-4 font-mono text-zinc-200">
                        ${prod.unitValue.toFixed(2)}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-4 text-right">
                        {linkedBOM ? (
                          <button
                            onClick={() => onProduceMore(prod.code)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-sm transition-all"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Produce Batch</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => onOpenNewBOMForProduct(prod.code)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs shadow-sm shadow-cyan-500/20 transition-all"
                          >
                            <Plus className="w-3 h-3 stroke-[3]" />
                            <span>Create BOM</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Finished Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-6 relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Register Finished Product</h3>
                <p className="text-xs text-zinc-400">
                  Add a new finished goods model into the factory catalog with auto-generated SKU
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveNewProduct} className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                  Finished Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={newProductName}
                  onChange={(e) => {
                    const name = e.target.value;
                    setNewProductName(name);
                    if (!isSkuEdited || !newProductCode.trim()) {
                      setNewProductCode(generateSKUFromName(name));
                    }
                  }}
                  placeholder="e.g. Autonomous Robotic Rover Model 4"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none"
                />
              </div>

              {/* Product SKU */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    Product SKU / Code *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setNewProductCode(generateSKUFromName(newProductName));
                      setIsSkuEdited(true);
                    }}
                    className="flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold px-2 py-0.5 rounded bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Auto Gen</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={newProductCode}
                  onChange={(e) => {
                    setIsSkuEdited(true);
                    setNewProductCode(e.target.value.toUpperCase());
                  }}
                  placeholder="e.g. FG-ROBOT-ROVER"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs font-mono font-bold text-cyan-400 outline-none"
                />
                <span className="text-[10px] text-zinc-500 block mt-1">
                  Auto-generated from Product Name &bull; Fully editable
                </span>
              </div>

              {/* Category & UOM */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-lg px-2.5 py-2 text-xs text-zinc-100 outline-none"
                  >
                    <option value="Industrial Robotics">Industrial Robotics</option>
                    <option value="Smart Home Devices">Smart Home Devices</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Medical Devices">Medical Devices</option>
                    <option value="Power Electronics">Power Electronics</option>
                    <option value="Manufactured Goods">Manufactured Goods</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                    Output Unit (UOM)
                  </label>
                  <select
                    value={newUom}
                    onChange={(e) => setNewUom(e.target.value as UnitOfMeasure)}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-lg px-2.5 py-2 text-xs text-zinc-100 outline-none font-mono"
                  >
                    <option value="pcs">pcs</option>
                    <option value="kg">kg</option>
                    <option value="boxes">boxes</option>
                    <option value="m">m</option>
                    <option value="l">l</option>
                  </select>
                </div>
              </div>

              {/* Unit Value */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                  Estimated Unit Sales Value ($)
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={newUnitValue}
                  onChange={(e) => setNewUnitValue(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs font-mono text-zinc-100 outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                  Description / Specification
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Key manufacturing details, industrial specifications..."
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none resize-none"
                />
              </div>

              {/* Checkbox to immediately create BOM */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="autoOpenBOMCheckbox"
                  checked={autoOpenBOM}
                  onChange={(e) => setAutoOpenBOM(e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-950 text-cyan-500 focus:ring-cyan-500"
                />
                <label htmlFor="autoOpenBOMCheckbox" className="text-xs text-zinc-300 cursor-pointer">
                  Immediately open Bill of Materials (BOM) creation recipe for this product
                </label>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newProductName.trim() || !newProductCode.trim()}
                  className="flex items-center gap-2 px-5 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-zinc-950 font-bold text-xs rounded-lg shadow-lg shadow-cyan-500/20 transition-all"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Register Product</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
