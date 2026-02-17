import React, { createContext, useCallback, useContext, useEffect, useReducer } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { transactionsService } from '@/services/transactions';
import { categoriesService } from '@/services/categories';
import type {
  Category,
  CreateCategoryPayload,
  CreateTransactionPayload,
  SupportedCurrency,
  Transaction,
  TransactionFilters,
  TransactionStats,
  UpdateCategoryPayload,
  UpdateTransactionPayload,
} from '@/types';

// ─── State ───────────────────────────────────────────────────────────────────

interface AppState {
  transactions: Transaction[];
  categories: Category[];
  stats: TransactionStats | null;
  currency: SupportedCurrency;
  loading: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
}

const initialState: AppState = {
  transactions: [],
  categories: [],
  stats: null,
  currency: 'USD',
  loading: false,
  error: null,
  page: 1,
  hasMore: true,
};

// ─── Actions ─────────────────────────────────────────────────────────────────

type Action =
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'SET_TRANSACTIONS'; txs: Transaction[]; hasMore: boolean; page: number }
  | { type: 'APPEND_TRANSACTIONS'; txs: Transaction[]; hasMore: boolean; page: number }
  | { type: 'ADD_TRANSACTION'; tx: Transaction }
  | { type: 'UPDATE_TRANSACTION'; tx: Transaction }
  | { type: 'REMOVE_TRANSACTION'; id: string }
  | { type: 'SET_CATEGORIES'; cats: Category[] }
  | { type: 'ADD_CATEGORY'; cat: Category }
  | { type: 'UPDATE_CATEGORY'; cat: Category }
  | { type: 'REMOVE_CATEGORY'; id: string }
  | { type: 'SET_STATS'; stats: TransactionStats }
  | { type: 'SET_CURRENCY'; currency: SupportedCurrency };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
    case 'SET_ERROR':
      return { ...state, error: action.error, loading: false };
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.txs, hasMore: action.hasMore, page: action.page, loading: false };
    case 'APPEND_TRANSACTIONS':
      return { ...state, transactions: [...state.transactions, ...action.txs], hasMore: action.hasMore, page: action.page, loading: false };
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.tx, ...state.transactions] };
    case 'UPDATE_TRANSACTION':
      return { ...state, transactions: state.transactions.map((t) => (t.id === action.tx.id ? action.tx : t)) };
    case 'REMOVE_TRANSACTION':
      return { ...state, transactions: state.transactions.filter((t) => t.id !== action.id) };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.cats };
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.cat] };
    case 'UPDATE_CATEGORY':
      return { ...state, categories: state.categories.map((c) => (c.id === action.cat.id ? action.cat : c)) };
    case 'REMOVE_CATEGORY':
      return { ...state, categories: state.categories.filter((c) => c.id !== action.id) };
    case 'SET_STATS':
      return { ...state, stats: action.stats };
    case 'SET_CURRENCY':
      return { ...state, currency: action.currency };
    default:
      return state;
  }
}

// ─── Context value ───────────────────────────────────────────────────────────

interface AppContextValue extends AppState {
  loadTransactions: (filters?: TransactionFilters) => Promise<void>;
  loadMore: (filters?: TransactionFilters) => Promise<void>;
  addTransaction: (data: CreateTransactionPayload) => Promise<Transaction>;
  updateTransaction: (id: string, data: UpdateTransactionPayload) => Promise<Transaction>;
  removeTransaction: (id: string) => Promise<void>;
  loadCategories: () => Promise<void>;
  addCategory: (data: CreateCategoryPayload) => Promise<Category>;
  updateCategory: (id: string, data: UpdateCategoryPayload) => Promise<Category>;
  removeCategory: (id: string) => Promise<void>;
  loadStats: (month?: string) => Promise<void>;
  setCurrency: (c: SupportedCurrency) => void;
  refresh: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

const CURRENCY_KEY = '@fintrack_currency';

// ─── Provider ────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load persisted currency
  useEffect(() => {
    AsyncStorage.getItem(CURRENCY_KEY).then((v) => {
      if (v) dispatch({ type: 'SET_CURRENCY', currency: v as SupportedCurrency });
    });
  }, []);

  // ── Transactions ─────────────────────────────────────────────────────────

  const loadTransactions = useCallback(async (filters?: TransactionFilters) => {
    dispatch({ type: 'SET_LOADING', loading: true });
    try {
      const res = await transactionsService.getAll({ ...filters, page: 1, page_size: 20 });
      dispatch({ type: 'SET_TRANSACTIONS', txs: res.items, hasMore: res.has_more, page: 1 });
    } catch (e: unknown) {
      dispatch({ type: 'SET_ERROR', error: (e as Error).message });
    }
  }, []);

  const loadMore = useCallback(async (filters?: TransactionFilters) => {
    if (state.loading || !state.hasMore) return;
    dispatch({ type: 'SET_LOADING', loading: true });
    try {
      const nextPage = state.page + 1;
      const res = await transactionsService.getAll({ ...filters, page: nextPage, page_size: 20 });
      dispatch({ type: 'APPEND_TRANSACTIONS', txs: res.items, hasMore: res.has_more, page: nextPage });
    } catch (e: unknown) {
      dispatch({ type: 'SET_ERROR', error: (e as Error).message });
    }
  }, [state.loading, state.hasMore, state.page]);

  const addTransaction = useCallback(async (data: CreateTransactionPayload) => {
    const tx = await transactionsService.create(data);
    dispatch({ type: 'ADD_TRANSACTION', tx });
    return tx;
  }, []);

  const updateTransaction = useCallback(async (id: string, data: UpdateTransactionPayload) => {
    const tx = await transactionsService.update(id, data);
    dispatch({ type: 'UPDATE_TRANSACTION', tx });
    return tx;
  }, []);

  const removeTransaction = useCallback(async (id: string) => {
    await transactionsService.remove(id);
    dispatch({ type: 'REMOVE_TRANSACTION', id });
  }, []);

  // ── Categories ───────────────────────────────────────────────────────────

  const loadCategories = useCallback(async () => {
    try {
      const cats = await categoriesService.getAll();
      dispatch({ type: 'SET_CATEGORIES', cats });
    } catch (e: unknown) {
      dispatch({ type: 'SET_ERROR', error: (e as Error).message });
    }
  }, []);

  const addCategory = useCallback(async (data: CreateCategoryPayload) => {
    const cat = await categoriesService.create(data);
    dispatch({ type: 'ADD_CATEGORY', cat });
    return cat;
  }, []);

  const updateCategory = useCallback(async (id: string, data: UpdateCategoryPayload) => {
    const cat = await categoriesService.update(id, data);
    dispatch({ type: 'UPDATE_CATEGORY', cat });
    return cat;
  }, []);

  const removeCategory = useCallback(async (id: string) => {
    await categoriesService.remove(id);
    dispatch({ type: 'REMOVE_CATEGORY', id });
  }, []);

  // ── Stats ────────────────────────────────────────────────────────────────

  const loadStats = useCallback(async (month?: string) => {
    try {
      const stats = await transactionsService.getStats(month);
      dispatch({ type: 'SET_STATS', stats });
    } catch (e: unknown) {
      dispatch({ type: 'SET_ERROR', error: (e as Error).message });
    }
  }, []);

  // ── Currency ─────────────────────────────────────────────────────────────

  const setCurrency = useCallback((c: SupportedCurrency) => {
    dispatch({ type: 'SET_CURRENCY', currency: c });
    AsyncStorage.setItem(CURRENCY_KEY, c);
  }, []);

  // ── Refresh all ──────────────────────────────────────────────────────────

  const refresh = useCallback(async () => {
    await Promise.all([loadTransactions(), loadCategories(), loadStats()]);
  }, [loadTransactions, loadCategories, loadStats]);

  // Initial load
  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <AppContext.Provider
      value={{
        ...state,
        loadTransactions,
        loadMore,
        addTransaction,
        updateTransaction,
        removeTransaction,
        loadCategories,
        addCategory,
        updateCategory,
        removeCategory,
        loadStats,
        setCurrency,
        refresh,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
