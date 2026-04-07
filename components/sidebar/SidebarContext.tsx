"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type SidebarMode = "navigation" | "search" | "chapters";

interface SidebarContextValue {
  onClose: () => void;
  setOnClose: (fn: () => void) => void;
  compactOnMobile: boolean;
  setCompactOnMobile: (compact: boolean) => void;
  mode: SidebarMode;
  setMode: (mode: SidebarMode) => void;
  boardId: string | null;
  setBoardId: (boardId: string | null) => void;
  boardName: string | null;
  setBoardName: (boardName: string | null) => void;
}

export const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ 
  children,
}: { 
  children: ReactNode, 
}) {
  const [mode, setMode] = useState<SidebarMode>("navigation");
  const [boardId, setBoardId] = useState<string | null>(null);
  const [boardName, setBoardName] = useState<string | null>(null);
  const [compactOnMobile, setCompactOnMobile] = useState(false);
  const [onCloseFn, setOnCloseFn] = useState<() => void>(() => () => {});

  const onClose = () => {
    onCloseFn();
  };

  return (
    <SidebarContext.Provider value={{ 
      onClose, 
      setOnClose: setOnCloseFn,
      compactOnMobile, 
      setCompactOnMobile,
      mode, 
      setMode,
      boardId,
      setBoardId,
      boardName,
      setBoardName
    }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebarContext() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebarContext must be used within a SidebarProvider");
  }
  return context;
}
