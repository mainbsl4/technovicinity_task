import { BillOfMaterials, ReadyProduct, RawMaterial } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

async function fetchJSON<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let errorDetails = response.statusText;
    try {
      const errorJson = await response.json();
      errorDetails = JSON.stringify(errorJson);
    } catch {
      // ignore
    }
    throw new Error(`API error [${response.status}] on ${endpoint}: ${errorDetails}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  // --- Bill of Materials (BOM) APIs ---
  getBOMs: async (): Promise<BillOfMaterials[]> => {
    return fetchJSON<BillOfMaterials[]>('/boms/');
  },

  getBOMById: async (id: string | number): Promise<BillOfMaterials> => {
    const cleanId = String(id).replace('bom-', '');
    return fetchJSON<BillOfMaterials>(`/boms/${cleanId}/`);
  },

  createBOM: async (bomData: Omit<BillOfMaterials, 'id' | 'createdAt' | 'updatedAt'>): Promise<BillOfMaterials> => {
    return fetchJSON<BillOfMaterials>('/boms/', {
      method: 'POST',
      body: JSON.stringify(bomData),
    });
  },

  updateBOM: async (bomData: BillOfMaterials): Promise<BillOfMaterials> => {
    const cleanId = String(bomData.id).replace('bom-', '');
    return fetchJSON<BillOfMaterials>(`/boms/${cleanId}/`, {
      method: 'PUT',
      body: JSON.stringify(bomData),
    });
  },

  deleteBOM: async (id: string | number): Promise<void> => {
    const cleanId = String(id).replace('bom-', '');
    await fetchJSON(`/boms/${cleanId}/`, {
      method: 'DELETE',
    });
  },

  // --- Finished Products APIs ---
  getProducts: async (): Promise<ReadyProduct[]> => {
    const rawProducts = await fetchJSON<any[]>('/products/');
    return rawProducts.map((p) => ({
      id: `rp-${p.id}`,
      code: p.code,
      name: p.name,
      description: p.description || '',
      stockQuantity: parseFloat(p.stock_quantity) || 0,
      uom: p.uom || 'pcs',
      unitValue: parseFloat(p.unit_value) || 0,
      bomId: p.bom_id ? `bom-${p.bom_id}` : '',
      category: p.category || 'Manufactured Goods',
      totalProduced: parseFloat(p.total_produced) || 0,
      lastProducedAt: p.last_produced_at,
    }));
  },

  createProduct: async (prod: Omit<ReadyProduct, 'id' | 'totalProduced'>): Promise<ReadyProduct> => {
    const payload = {
      code: prod.code,
      name: prod.name,
      description: prod.description,
      category: prod.category,
      stock_quantity: prod.stockQuantity,
      uom: prod.uom,
      unit_value: prod.unitValue,
      total_produced: prod.stockQuantity,
    };
    const res = await fetchJSON<any>('/products/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return {
      id: `rp-${res.id}`,
      code: res.code,
      name: res.name,
      description: res.description || '',
      stockQuantity: parseFloat(res.stock_quantity) || 0,
      uom: res.uom || 'pcs',
      unitValue: parseFloat(res.unit_value) || 0,
      bomId: res.bom_id ? `bom-${res.bom_id}` : '',
      category: res.category || 'Manufactured Goods',
      totalProduced: parseFloat(res.total_produced) || 0,
    };
  },

  // --- Raw Materials APIs ---
  getRawMaterials: async (): Promise<RawMaterial[]> => {
    const rawItems = await fetchJSON<any[]>('/raw-materials/');
    return rawItems.map((m) => ({
      id: `rm-${m.id}`,
      code: m.code,
      name: m.name,
      category: m.category || 'Other',
      stockQuantity: parseFloat(m.stock_quantity) || 0,
      uom: m.uom || 'pcs',
      minThreshold: parseFloat(m.min_threshold) || 10,
      unitCost: parseFloat(m.unit_cost) || 0,
      location: m.location || '',
      lastUpdated: m.last_updated,
    }));
  },

  updateRawMaterialStock: async (idOrCode: string, newStock: number): Promise<void> => {
    const cleanId = String(idOrCode).replace('rm-', '');
    // If it's a numeric ID, use primary key endpoint
    if (/^\d+$/.test(cleanId)) {
      await fetchJSON(`/raw-materials/${cleanId}/`, {
        method: 'PATCH',
        body: JSON.stringify({ stock_quantity: newStock }),
      });
    } else {
      // Find by code from current list then patch by pk
      try {
        const rawItems = await fetchJSON<any[]>('/raw-materials/');
        const matched = rawItems.find(
          (m: any) => m.code.toUpperCase() === idOrCode.toUpperCase() || String(m.id) === cleanId
        );
        if (matched) {
          await fetchJSON(`/raw-materials/${matched.id}/`, {
            method: 'PATCH',
            body: JSON.stringify({ stock_quantity: newStock }),
          });
        }
      } catch (err) {
        console.warn('Failed to patch raw material by code:', err);
      }
    }
  },

  updateProductStock: async (idOrCode: string, newStock: number, totalProduced?: number): Promise<void> => {
    const cleanId = String(idOrCode).replace('rp-', '');
    const body: any = { stock_quantity: newStock };
    if (totalProduced !== undefined) body.total_produced = totalProduced;

    if (/^\d+$/.test(cleanId)) {
      await fetchJSON(`/products/${cleanId}/`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
    } else {
      try {
        const prods = await fetchJSON<any[]>('/products/');
        const matched = prods.find(
          (p: any) => p.code.toUpperCase() === idOrCode.toUpperCase() || String(p.id) === cleanId
        );
        if (matched) {
          await fetchJSON(`/products/${matched.id}/`, {
            method: 'PATCH',
            body: JSON.stringify(body),
          });
        }
      } catch (err) {
        console.warn('Failed to patch product by code:', err);
      }
    }
  },
};
