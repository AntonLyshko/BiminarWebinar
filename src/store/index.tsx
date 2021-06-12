import { configure } from "mobx";
import { createContext, useContext, ReactNode } from "react";
import { RootStore } from "./root";

if (process.env.NODE_ENV === "development") {
  configure({
    enforceActions: "always",
    computedRequiresReaction: true,
    reactionRequiresObservable: true,
    observableRequiresReaction: true,
    disableErrorBoundaries: true
  });
}

const rootStore = new RootStore();
const RootContext = createContext(rootStore);

export function useRootStore(): RootStore {
  return useContext(RootContext);
}

export function RootStoreProvider({ children }: { children: ReactNode}) {
  return (
    <RootContext.Provider value={rootStore}>
      {children}
    </RootContext.Provider>
  )
}
