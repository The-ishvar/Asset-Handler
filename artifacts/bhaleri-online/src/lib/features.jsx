import { createContext, useContext, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "./api";

export const DEFAULT_FEATURES = {
  posts: true,
  shops: true,
  autoBooking: true,
  busBooking: true,
  medical: true,
  schools: true,
  reels: true,
  stories: true,
  marketplace: true,
  map: true,
  emergency: true,
  jobs: false,
  events: false,
  notices: false,
  snaps: false,
  messages: false,
  notifications: false,
  bookEvent: false,
  about: false,
  provider: false,
};

const FeatureContext = createContext({
  features: DEFAULT_FEATURES,
  isEnabled: () => true,
  refetch: () => {},
  isLoading: false,
});

export function FeatureProvider({ children }) {
  const { data: features = DEFAULT_FEATURES, refetch, isLoading } = useQuery({
    queryKey: ["features"],
    queryFn: () => api.get("/features").then((r) => r.data),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
    retry: 2,
  });

  const isEnabled = useCallback(
    (key) => {
      if (!key) return true;
      return features[key] !== false;
    },
    [features]
  );

  return (
    <FeatureContext.Provider value={{ features, isEnabled, refetch, isLoading }}>
      {children}
    </FeatureContext.Provider>
  );
}

export function useFeatures() {
  return useContext(FeatureContext);
}

export function FeatureGate({ featureKey, children }) {
  const { isEnabled } = useFeatures();

  if (!isEnabled(featureKey)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="text-6xl">🚧</div>
          <h2 className="text-2xl font-bold text-foreground">Feature Unavailable</h2>
          <p className="text-muted-foreground">
            This feature is currently unavailable.
          </p>
        </div>
      </div>
    );
  }

  return children;
}
