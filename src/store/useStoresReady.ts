// Renvoie true quand les données sauvegardées ont été relues depuis le téléphone.
// Sans ça, l'app pourrait afficher des valeurs par défaut le temps de la lecture.
import { useEffect, useState } from 'react';
import { useProgressStore } from './progressStore';
import { useUserStore } from './userStore';

interface Hydratable {
  persist: {
    hasHydrated: () => boolean;
    onFinishHydration: (callback: () => void) => () => void;
  };
}

function waitForHydration(store: Hydratable): Promise<void> {
  if (store.persist.hasHydrated()) return Promise.resolve();
  return new Promise((resolve) => {
    const unsubscribe = store.persist.onFinishHydration(() => {
      unsubscribe();
      resolve();
    });
  });
}

export function useStoresReady(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([waitForHydration(useUserStore), waitForHydration(useProgressStore)]).then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return ready;
}
