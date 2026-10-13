'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { addBOM, updateBOM } from '@/lib/redux/slices/bomSlice';
import { setProductBOMId, addNewReadyProduct } from '@/lib/redux/slices/inventorySlice';
import { BillOfMaterials, BOMMaterialItem, UnitOfMeasure } from '@/lib/types';
import { api } from '@/lib/api';
import { 
  Layers, 
  X, 
  Plus, 
  Trash2, 
  AlertCircle, 
  Check, 
  Sparkles,
  Info,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Loader2
} from 'lucide-react';

interface BOMEditorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingBOM?: BillOfMaterials | null;
  preselectedProductCode?: string;
}

// Auto-generates clean, standardized SKU from product name
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

export const BOMEditorDialog: React.FC<BOMEditorDialogProps> = ({
  isOpen,
  onClose,
  editingBOM,
  preselectedProductCode,
}) => {
  const dispatch = useAppDispatch();
  const boms = useAppSelector((state) => state.bom.boms);
  const readyProducts = useAppSelector((state) => state.inventory.readyProducts);
  const rawMaterials = useAppSelector((state) => state.inventory.rawMaterials);

  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [isCustomProduct, setIsCustomProduct] = useState<boolean>(false);
  const [isSkuManuallyEdited, setIsSkuManuallyEdited] = useState<boolean>(false);

  const [productCode, setProductCode] = useState(editingBOM?.productCode || '');
  const [productName, setProductName] = useState(editingBOM?.productName || '');
  const [description, setDescription] = useState(editingBOM?.description || '');
  const [version, setVersion] = useState(editingBOM?.version || '1.0');
  const [outputUom, setOutputUom] = useState<UnitOfMeasure>(editingBOM?.outputUom || 'pcs');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Compute other BOMs excluding current one being edited
  const otherBOMs = React.useMemo(() => {
    return boms.filter((b) => b.id !== editingBOM?.id);
  }, [boms, editingBOM]);

  const existingBOMProductCodes = React.useMemo(() => {
    return new Set(otherBOMs.map((b) => b.productCode.toUpperCase().trim()));
  }, [otherBOMs]);

  const existingBOMProductNames = React.useMemo(() => {
    return new Set(otherBOMs.map((b) => b.productName.toLowerCase().trim()));
  }, [otherBOMs]);

  // Validation: Check if selected/entered product is already assigned to another BOM
  const isDuplicateCode = Boolean(
    productCode.trim() && existingBOMProductCodes.has(productCode.trim().toUpperCase())
  );
  const isDuplicateName = Boolean(
    productName.trim() && existingBOMProductNames.has(productName.trim().toLowerCase())
  );
  const hasDuplicateError = isDuplicateCode || isDuplicateName;

  const [items, setItems] = useState<BOMMaterialItem[]>(
    editingBOM?.items || [
      {
        id: `bi-new-1`,
        materialId: rawMaterials[0]?.id || '',
        materialCode: rawMaterials[0]?.code || '',
        materialName: rawMaterials[0]?.name || '',
        quantityPerUnit: 1,
        uom: rawMaterials[0]?.uom || 'pcs',
        wastePercentage: 2.0,
      },
    ]
  );

  React.useEffect(() => {
    if (editingBOM) {
      setProductCode(editingBOM.productCode);
      setProductName(editingBOM.productName);
      setDescription(editingBOM.description);
      setVersion(editingBOM.version);
      setOutputUom(editingBOM.outputUom);
      setItems(editingBOM.items);
      setIsSkuManuallyEdited(true);

      // Check if product is in catalog
      const matching = readyProducts.find(
        (p) =>
          p.code.toUpperCase() === editingBOM.productCode.toUpperCase() ||
          p.name.toLowerCase() === editingBOM.productName.toLowerCase()
      );
      if (matching) {
        setSelectedProductId(matching.id);
        setIsCustomProduct(false);
      } else {
        setSelectedProductId('__NEW__');
        setIsCustomProduct(true);
      }
    } else {
      setDescription('');
      setVersion('1.0');
      setOutputUom('pcs');
      setIsSkuManuallyEdited(false);

      if (preselectedProductCode) {
        const matching = readyProducts.find(
          (p) => p.code.toUpperCase() === preselectedProductCode.toUpperCase()
        );
        if (matching) {
          setSelectedProductId(matching.id);
          setIsCustomProduct(false);
          setProductName(matching.name);
          setProductCode(matching.code || generateSKUFromName(matching.name));
          setDescription(matching.description || '');
          setOutputUom(matching.uom || 'pcs');
        } else {
          setSelectedProductId('');
          setIsCustomProduct(false);
          setProductName('');
          setProductCode('');
        }
      } else {
        // Default to unselected so user can choose from the dropdown
        setSelectedProductId('');
        setIsCustomProduct(false);
        setProductName('');
        setProductCode('');
      }

      if (rawMaterials.length > 0) {
        setItems([
          {
            id: `bi-new-${Date.now()}`,
            materialId: rawMaterials[0].id,
            materialCode: rawMaterials[0].code,
            materialName: rawMaterials[0].name,
            quantityPerUnit: 1,
            uom: rawMaterials[0].uom,
            wastePercentage: 2.0,
          },
        ]);
      }
    }
  }, [editingBOM, preselectedProductCode, readyProducts, existingBOMProductCodes, existingBOMProductNames, rawMaterials]);

  if (!isOpen) return null;

  const handleProductSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === '__NEW__') {
      setIsCustomProduct(true);
      setSelectedProductId('__NEW__');
      setProductName('');
      setProductCode(generateSKUFromName(''));
      setIsSkuManuallyEdited(false);
      setDescription('');
    } else if (val === '') {
      setIsCustomProduct(false);
      setSelectedProductId('');
      setProductName('');
      setProductCode('');
      setIsSkuManuallyEdited(false);
    } else {
      setIsCustomProduct(false);
      setSelectedProductId(val);
      setIsSkuManuallyEdited(false);
      const prod = readyProducts.find((p) => p.id === val);
      if (prod) {
        setProductName(prod.name);
        setProductCode(prod.code || generateSKUFromName(prod.name));
        if (prod.description) setDescription(prod.description);
        if (prod.uom) setOutputUom(prod.uom);
      }
    }
  };

  const handleAddMaterialRow = () => {
    if (rawMaterials.length === 0) return;
    const defaultMat = rawMaterials[0];
    setItems([
      ...items,
      {
        id: `bi-row-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        materialId: defaultMat.id,
        materialCode: defaultMat.code,
        materialName: defaultMat.name,
        quantityPerUnit: 1,
        uom: defaultMat.uom,
        wastePercentage: 1.5,
      },
    ]);
  };

  const handleRemoveMaterialRow = (id: string) => {
    if (items.length <= 1) return;
    setItems(items.filter((item) => item.id !== id));
  };

  const handleMaterialChange = (rowId: string, materialId: string) => {
    const found = rawMaterials.find((m) => m.id === materialId);
    if (!found) return;

    setItems(
      items.map((row) =>
        row.id === rowId
          ? {
              ...row,
              materialId: found.id,
              materialCode: found.code,
              materialName: found.name,
              uom: found.uom,
            }
          : row
      )
    );
  };

  const handleQuantityChange = (rowId: string, value: string) => {
    const qty = parseFloat(value) || 0;
    setItems(
      items.map((row) => (row.id === rowId ? { ...row, quantityPerUnit: qty } : row))
    );
  };

  const handleWastePercentChange = (rowId: string, value: string) => {
    const wp = parseFloat(value) || 0;
    setItems(
      items.map((row) => (row.id === rowId ? { ...row, wastePercentage: wp } : row))
    );
  };

  // Calculate estimated unit cost
  const estimatedTotalCost = items.reduce((acc, row) => {
    const mat = rawMaterials.find(
      (m) =>
        (row.materialId && m.id === row.materialId) ||
        (row.materialCode && m.code.toUpperCase() === row.materialCode.toUpperCase())
    );
    if (!mat) return acc;
    const totalQtyNeeded = row.quantityPerUnit * (1 + row.wastePercentage / 100);
    return acc + totalQtyNeeded * mat.unitCost;
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productCode.trim() || !productName.trim() || items.length === 0) return;

    if (hasDuplicateError) {
      alert('This product name or SKU is already assigned to an existing Bill of Materials. A product cannot be selected in multiple BOMs.');
      return;
    }

    const trimmedCode = productCode.trim().toUpperCase();
    const trimmedName = productName.trim();

    setIsSaving(true);
    setApiError(null);

    try {
      if (editingBOM) {
        const payload: BillOfMaterials = {
          ...editingBOM,
          productCode: trimmedCode,
          productName: trimmedName,
          description: description.trim(),
          version: version.trim(),
          outputUom,
          items,
          estimatedUnitCost: Number(estimatedTotalCost.toFixed(2)),
          updatedAt: new Date().toISOString(),
        };

        let updatedData = payload;
        try {
          updatedData = await api.updateBOM(payload);
        } catch (apiErr: any) {
          console.warn('Backend API update failed, continuing with local sync:', apiErr);
          if (apiErr.message?.includes('400')) {
            throw apiErr;
          }
        }

        dispatch(updateBOM(updatedData));
        dispatch(setProductBOMId({ productCode: trimmedCode, bomId: editingBOM.id }));
      } else {
        const payload = {
          productCode: trimmedCode,
          productName: trimmedName,
          description: description.trim(),
          version: version.trim(),
          outputUom,
          baseQuantity: 1,
          items,
          estimatedUnitCost: Number(estimatedTotalCost.toFixed(2)),
        };

        let createdBOM: BillOfMaterials;
        try {
          createdBOM = await api.createBOM(payload);
        } catch (apiErr: any) {
          console.warn('Backend API create failed, falling back to local creation:', apiErr);
          if (apiErr.message?.includes('400')) {
            throw apiErr;
          }
          createdBOM = {
            ...payload,
            id: `bom-${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }

        dispatch(addBOM(createdBOM));

        // Link in catalog or add if new
        const foundInCatalog = readyProducts.find(
          (p) =>
            p.code.toUpperCase() === trimmedCode ||
            p.name.toLowerCase() === trimmedName.toLowerCase()
        );
        if (foundInCatalog) {
          dispatch(setProductBOMId({ productCode: trimmedCode, bomId: createdBOM.id }));
        } else {
          dispatch(
            addNewReadyProduct({
              code: trimmedCode,
              name: trimmedName,
              description: description.trim() || `Finished product recipe for ${trimmedName}`,
              stockQuantity: 0,
              uom: outputUom,
              unitValue: Number((estimatedTotalCost * 1.5).toFixed(2)) || 100.0,
              bomId: createdBOM.id,
              category: 'Manufactured Goods',
            })
          );
        }
      }

      onClose();
    } catch (err: any) {
      setApiError(err.message || 'Failed to save Bill of Materials');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-3xl rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-6 relative max-h-[92vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5 flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              {editingBOM ? 'Edit Bill of Materials (BOM)' : 'Create Bill of Materials (BOM)'}
            </h2>
            <p className="text-xs text-zinc-400">
              Define manufacturing recipe: Static product code, required raw materials, units, and waste percentages
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
          {apiError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 font-mono">{apiError}</div>
              <button
                type="button"
                onClick={() => setApiError(null)}
                className="text-rose-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Product Name Dropdown & SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Finished Product Name Dropdown */}
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Finished Product Name
                </label>
                <span className="text-[10px] text-zinc-400">
                  {isCustomProduct ? 'Custom Product Mode' : 'Catalog Selection'}
                </span>
              </div>

              <select
                required
                value={isCustomProduct ? '__NEW__' : selectedProductId}
                onChange={handleProductSelectChange}
                className={`w-full bg-zinc-950 border rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none transition-colors ${
                  hasDuplicateError
                    ? 'border-rose-500 focus:border-rose-500'
                    : 'border-zinc-800 focus:border-cyan-500'
                }`}
              >
                <option value="" disabled className="text-zinc-500 bg-zinc-900">
                  -- Select a Finished Product from Catalog --
                </option>

                {/* Available Products */}
                <optgroup label="Available Catalog Products (Ready for BOM)" className="bg-zinc-900 text-cyan-400 font-semibold">
                  {readyProducts
                    .filter((p) => {
                      const isAssigned =
                        existingBOMProductCodes.has(p.code.toUpperCase().trim()) ||
                        existingBOMProductNames.has(p.name.toLowerCase().trim());
                      return !isAssigned;
                    })
                    .map((p) => (
                      <option key={p.id} value={p.id} className="text-zinc-100 bg-zinc-900">
                        {p.name} [{p.code}] — Available
                      </option>
                    ))}
                </optgroup>

                {/* Products with existing BOM (Disabled so user cannot select in multiple BOMs) */}
                <optgroup label="Assigned Products (Already has a BOM Recipe)" className="bg-zinc-900 text-zinc-500 font-semibold">
                  {readyProducts
                    .filter((p) => {
                      const isAssigned =
                        existingBOMProductCodes.has(p.code.toUpperCase().trim()) ||
                        existingBOMProductNames.has(p.name.toLowerCase().trim());
                      return isAssigned;
                    })
                    .map((p) => (
                      <option
                        key={p.id}
                        value={p.id}
                        disabled
                        className="text-zinc-500 bg-zinc-900 line-through"
                      >
                        {p.name} [{p.code}] — ⛔ BOM already exists (Cannot select in multiple BOMs)
                      </option>
                    ))}
                </optgroup>

                {/* New / Custom Product */}
                <optgroup label="Custom / New Finished Product" className="bg-zinc-900 text-zinc-300 font-semibold">
                  <option value="__NEW__" className="text-cyan-400 font-bold bg-zinc-900">
                    + Enter New Product Not in Catalog...
                  </option>
                </optgroup>
              </select>

              {/* Custom Product Input if __NEW__ chosen */}
              {isCustomProduct && (
                <div className="mt-2 animate-in fade-in slide-in-from-top-1 duration-150">
                  <input
                    type="text"
                    required
                    value={productName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setProductName(val);
                      if (!isSkuManuallyEdited || !productCode.trim()) {
                        setProductCode(generateSKUFromName(val));
                      }
                    }}
                    placeholder="Enter custom finished product name..."
                    className="w-full bg-zinc-950 border border-cyan-500/50 focus:border-cyan-400 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none"
                  />
                </div>
              )}

              {/* Feedback Alert or Helper */}
              {hasDuplicateError ? (
                <div className="flex items-center gap-1.5 text-[11px] text-rose-400 mt-1.5 font-medium bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-lg">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>
                    A BOM recipe already exists for this product. Products cannot have multiple BOMs.
                  </span>
                </div>
              ) : selectedProductId && !isCustomProduct ? (
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>
                    1-to-1 BOM recipe mapping verified for this finished product.
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-1">
                  <span>Each finished product can only be linked to a single BOM recipe.</span>
                  <span>
                    {readyProducts.filter(
                      (p) =>
                        !existingBOMProductCodes.has(p.code.toUpperCase().trim()) &&
                        !existingBOMProductNames.has(p.name.toLowerCase().trim())
                    ).length}{' '}
                    available in catalog
                  </span>
                </div>
              )}
            </div>

            {/* Product Code / SKU (Auto-generated & Editable) */}
            <div className="sm:col-span-1">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Product SKU / Code
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const generated = generateSKUFromName(productName);
                    setProductCode(generated);
                    setIsSkuManuallyEdited(true);
                  }}
                  title="Auto-generate or refresh SKU based on product name"
                  className="flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold px-2 py-0.5 rounded bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all cursor-pointer"
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Auto Gen</span>
                </button>
              </div>
              <input
                type="text"
                required
                value={productCode}
                onChange={(e) => {
                  setIsSkuManuallyEdited(true);
                  setProductCode(e.target.value.toUpperCase());
                }}
                placeholder="e.g. FG-ROBOT-ARM"
                className={`w-full bg-zinc-950 border rounded-lg px-3 py-2 text-xs font-mono font-bold outline-none transition-colors ${
                  isDuplicateCode
                    ? 'border-rose-500 text-rose-300 focus:border-rose-500'
                    : 'border-zinc-800 focus:border-cyan-500 text-cyan-400'
                }`}
              />
              <span className="text-[10px] text-zinc-400 block mt-1">
                Auto-generated SKU &bull; <span className="text-zinc-200 font-medium">Editable</span> (modify anytime)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Description / Application
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Factory floor autonomous positioning module"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                  Revision
                </label>
                <input
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                  Output Unit
                </label>
                <select
                  value={outputUom}
                  onChange={(e) => setOutputUom(e.target.value as UnitOfMeasure)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-lg px-2 py-2 text-xs text-zinc-100 outline-none font-mono"
                >
                  <option value="pcs">pcs</option>
                  <option value="kg">kg</option>
                  <option value="boxes">boxes</option>
                  <option value="m">m</option>
                  <option value="l">l</option>
                </select>
              </div>
            </div>
          </div>

          {/* Raw Materials Recipe Mapping Table */}
          <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950/50 mt-4">
            <div className="p-3 bg-zinc-900/80 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Raw Materials & Loss Percentages
                </span>
                <span className="text-[11px] text-zinc-400">
                  Predefined waste % automatically routes scrap to waste inventory upon run completion
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddMaterialRow}
                className="flex items-center gap-1 px-3 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg text-xs font-bold transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Ingredient</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-[10px] text-zinc-400 uppercase tracking-wider font-semibold bg-zinc-900/40">
                    <th className="py-2.5 px-3">Raw Material</th>
                    <th className="py-2.5 px-3 w-32">Qty Per 1 {outputUom}</th>
                    <th className="py-2.5 px-3 w-28">Predefined Waste %</th>
                    <th className="py-2.5 px-3">Effective Intake</th>
                    <th className="py-2.5 px-2 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {items.map((row) => {
                    const totalPerUnit = row.quantityPerUnit * (1 + row.wastePercentage / 100);
                    return (
                      <tr key={row.id} className="hover:bg-zinc-800/20">
                        {/* Material Selector */}
                        <td className="py-2 px-3">
                          <select
                            value={row.materialId}
                            onChange={(e) => handleMaterialChange(row.id, e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700 focus:border-cyan-500 rounded px-2.5 py-1.5 text-xs text-zinc-100 outline-none"
                          >
                            {rawMaterials.map((rm) => (
                              <option key={rm.id} value={rm.id}>
                                [{rm.code}] {rm.name} ({rm.uom})
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Quantity */}
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              step="any"
                              min="0.0001"
                              required
                              value={row.quantityPerUnit}
                              onChange={(e) => handleQuantityChange(row.id, e.target.value)}
                              className="w-20 bg-zinc-900 border border-zinc-700 focus:border-cyan-500 rounded px-2 py-1.5 text-xs text-zinc-100 font-mono"
                            />
                            <span className="text-[11px] font-mono text-zinc-400">{row.uom}</span>
                          </div>
                        </td>

                        {/* Predefined Waste % */}
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="100"
                              required
                              value={row.wastePercentage}
                              onChange={(e) => handleWastePercentChange(row.id, e.target.value)}
                              className="w-16 bg-zinc-900 border border-zinc-700 focus:border-cyan-500 rounded px-2 py-1.5 text-xs text-amber-300 font-mono font-bold"
                            />
                            <span className="text-zinc-400 font-mono">%</span>
                          </div>
                        </td>

                        {/* Effective Consumption */}
                        <td className="py-2 px-3">
                          <div className="font-mono text-xs text-zinc-300 font-medium">
                            {totalPerUnit.toFixed(3)} {row.uom}
                          </div>
                          <div className="text-[10px] text-zinc-500">
                            (+{(row.quantityPerUnit * (row.wastePercentage / 100)).toFixed(3)} scrap)
                          </div>
                        </td>

                        {/* Delete Row */}
                        <td className="py-2 px-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveMaterialRow(row.id)}
                            disabled={items.length <= 1}
                            className="p-1 rounded text-zinc-500 hover:text-rose-400 disabled:opacity-30 disabled:hover:text-zinc-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Recipe Footer Summary */}
            <div className="p-3 bg-zinc-900/80 border-t border-zinc-800 flex items-center justify-between text-xs">
              <span className="text-zinc-400">Total Materials in Recipe: <strong className="text-white">{items.length} items</strong></span>
              <span className="text-zinc-400">
                Estimated Material Unit Cost: <strong className="text-cyan-400 font-mono">${estimatedTotalCost.toFixed(2)} / {outputUom}</strong>
              </span>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !productCode.trim() || !productName.trim() || hasDuplicateError || items.length === 0}
              className="flex items-center gap-2 px-5 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:hover:bg-cyan-500 disabled:cursor-not-allowed text-zinc-950 font-bold text-xs rounded-lg shadow-lg shadow-cyan-500/20 transition-all"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{editingBOM ? 'Update Recipe' : 'Save BOM Recipe'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
