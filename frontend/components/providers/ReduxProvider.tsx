'use client';

import { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { makeStore, AppStore, loadState, REHYDRATE_ACTION } from '../../lib/redux/store';

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
    }
  }, []);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
