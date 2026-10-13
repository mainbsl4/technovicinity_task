'use client';

import { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { makeStore, AppStore, loadState, REHYDRATE_ACTION } from '../../lib/redux/store';
import { api } from '../../lib/api';
import { setBOMs } from '../../lib/redux/slices/bomSlice';
import { setReadyProducts, setRawMaterials } from '../../lib/redux/slices/inventorySlice';

export default function ReduxProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  useEffect(() => {
    if (storeRef.current) {
      const persistedState = loadState();
      if (persistedState) {
        storeRef.current.dispatch({ type: REHYDRATE_ACTION, payload: persistedState });
      }

      // Sync latest data from Django Class-Based View APIs
      const syncWithBackend = async () => {
        try {
          const [boms, prods, mats] = await Promise.allSettled([
            api.getBOMs(),
            api.getProducts(),
            api.getRawMaterials(),
          ]);

          if (storeRef.current) {
            if (boms.status === 'fulfilled' && Array.isArray(boms.value)) {
              storeRef.current.dispatch(setBOMs(boms.value));
            }
            if (prods.status === 'fulfilled' && Array.isArray(prods.value)) {
              storeRef.current.dispatch(setReadyProducts(prods.value));
            }
            if (mats.status === 'fulfilled' && Array.isArray(mats.value)) {
              storeRef.current.dispatch(setRawMaterials(mats.value));
            }
          }
        } catch (err) {
          console.warn('Backend sync bypassed:', err);
        }
      };

      syncWithBackend();
    }
  }, []);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
