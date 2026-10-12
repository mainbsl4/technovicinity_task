import { configureStore, combineReducers } from '@reduxjs/toolkit';
import inventoryReducer from './slices/inventorySlice';
import bomReducer from './slices/bomSlice';
import productionReducer from './slices/productionSlice';

const rootReducer = combineReducers({
  inventory: inventoryReducer,
  bom: bomReducer,
  production: productionReducer,
});

const STORAGE_KEY = 'vortex_mes_state_v1';

// Load persisted state from localStorage if available
const loadState = () => {
  if (typeof window === 'undefined') return undefined;
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.warn('Failed to load state from localStorage:', err);
    return undefined;
  }
};

// Save state to localStorage on changes
const saveState = (state: ReturnType<typeof rootReducer>) => {
  if (typeof window === 'undefined') return;
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serializedState);
  } catch (err) {
    console.warn('Failed to persist state to localStorage:', err);
  }
};

export const makeStore = () => {
  const preloadedState = loadState();

  const store = configureStore({
    reducer: rootReducer,
    preloadedState,
  });

  // Subscribe to changes to update localStorage
  if (typeof window !== 'undefined') {
    store.subscribe(() => {
      saveState(store.getState());
    });
  }

  return store;
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = AppStore['dispatch'];
