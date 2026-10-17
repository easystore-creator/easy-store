import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';
import { useToast } from './ToastContext';

interface CompareContextType {
  compareList: Product[];
  addToCompare: (product: Product) => boolean;
  removeFromCompare: (productId: string) => void;
  toggleCompare: (product: Product) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
  isCompareModalOpen: boolean;
  openCompareModal: () => void;
  closeCompareModal: () => void;
  activeVideoProduct: Product | null;
  openVideoModal: (product: Product) => void;
  closeVideoModal: () => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);
const STORAGE_KEY = 'easystore_compare_products_v1';

export const CompareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const [compareList, setCompareList] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [activeVideoProduct, setActiveVideoProduct] = useState<Product | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(compareList));
    } catch {
      // ignore
    }
  }, [compareList]);

  const isInCompare = (productId: string) => {
    return compareList.some((p) => p.id === productId);
  };

  const addToCompare = (product: Product): boolean => {
    if (isInCompare(product.id)) {
      showToast('Already Added', `${product.name.slice(0, 30)}... is already in comparison list`, 'info');
      return true;
    }
    if (compareList.length >= 3) {
      showToast('Comparison Limit', 'You can compare up to 3 products side-by-side', 'info');
      return false;
    }
    setCompareList((prev) => [...prev, product]);
    showToast('Added to Compare', `${product.name.slice(0, 30)}... added to comparison (${compareList.length + 1}/3)`, 'success');
    return true;
  };

  const removeFromCompare = (productId: string) => {
    setCompareList((prev) => prev.filter((p) => p.id !== productId));
  };

  const toggleCompare = (product: Product) => {
    if (isInCompare(product.id)) {
      removeFromCompare(product.id);
      showToast('Removed', 'Removed from product comparison', 'info');
    } else {
      addToCompare(product);
    }
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  const openCompareModal = () => {
    if (compareList.length === 0) {
      showToast('No Products Selected', 'Select at least one product to open comparison', 'info');
      return;
    }
    setIsCompareModalOpen(true);
  };

  const closeCompareModal = () => {
    setIsCompareModalOpen(false);
  };

  const openVideoModal = (product: Product) => {
    setActiveVideoProduct(product);
  };

  const closeVideoModal = () => {
    setActiveVideoProduct(null);
  };

  return (
    <CompareContext.Provider
      value={{
        compareList,
        addToCompare,
        removeFromCompare,
        toggleCompare,
        clearCompare,
        isInCompare,
        isCompareModalOpen,
        openCompareModal,
        closeCompareModal,
        activeVideoProduct,
        openVideoModal,
        closeVideoModal,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};
