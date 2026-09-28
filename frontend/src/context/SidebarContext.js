import React, { useState, useMemo, useCallback, createContext } from "react";

// create context
export const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const toggleCartDrawer = useCallback(() => setCartDrawerOpen((prev) => !prev), []);
  const closeCartDrawer = useCallback(() => setCartDrawerOpen(false), []);

  const toggleCategoryDrawer = useCallback(() => setCategoryDrawerOpen((prev) => !prev), []);
  const closeCategoryDrawer = useCallback(() => setCategoryDrawerOpen(false), []);

  const toggleFilterDrawer = useCallback(() => setFilterDrawerOpen((prev) => !prev), []);
  const closeFilterDrawer = useCallback(() => setFilterDrawerOpen(false), []);

  const toggleModal = useCallback(() => setIsModalOpen((prev) => !prev), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);
  
  const toggleSearch = useCallback(() => setShowSearch((prev) => !prev), []);
  const closeSearch = useCallback(() => setShowSearch(false), []);

  const handleChangePage = useCallback((p) => {
    setCurrentPage(p);
  }, []);

  const value = useMemo(
    () => ({
      cartDrawerOpen,
      toggleCartDrawer,
      closeCartDrawer,
      setCartDrawerOpen,
      categoryDrawerOpen,
      toggleCategoryDrawer,
      closeCategoryDrawer,
      filterDrawerOpen,
      toggleFilterDrawer,
      closeFilterDrawer,
      isModalOpen,
      toggleModal,
      closeModal,
      showSearch,
      toggleSearch,
      closeSearch,
      setShowSearch,
      currentPage,
      setCurrentPage,
      handleChangePage,
      isLoading,
      setIsLoading,
    }),

    [
      cartDrawerOpen,
      categoryDrawerOpen,
      filterDrawerOpen,
      isModalOpen,
      currentPage,
      isLoading,
      showSearch,
    ]
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
};
