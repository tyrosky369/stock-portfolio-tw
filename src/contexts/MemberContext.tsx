"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

interface MemberContextType {
  selectedOwner: string;          // "全部" or a specific name
  setSelectedOwner: (v: string) => void;
  members: string[];
  refreshMembers: () => Promise<void>;
}

const MemberContext = createContext<MemberContextType>({
  selectedOwner: "全部",
  setSelectedOwner: () => {},
  members: [],
  refreshMembers: async () => {},
});

export function MemberProvider({ children }: { children: React.ReactNode }) {
  const [selectedOwner, setSelectedOwnerState] = useState("全部");
  const [members, setMembers] = useState<string[]>([]);

  const refreshMembers = useCallback(async () => {
    try {
      const res = await fetch("/api/members");
      const data: string[] = await res.json();
      setMembers(data);
    } catch {
      // ignore
    }
  }, []);

  // 從 localStorage 還原上次選擇的成員
  useEffect(() => {
    const saved = localStorage.getItem("selectedOwner");
    if (saved) setSelectedOwnerState(saved);
    refreshMembers();
  }, [refreshMembers]);

  function setSelectedOwner(v: string) {
    setSelectedOwnerState(v);
    localStorage.setItem("selectedOwner", v);
  }

  return (
    <MemberContext.Provider value={{ selectedOwner, setSelectedOwner, members, refreshMembers }}>
      {children}
    </MemberContext.Provider>
  );
}

export function useMember() {
  return useContext(MemberContext);
}
