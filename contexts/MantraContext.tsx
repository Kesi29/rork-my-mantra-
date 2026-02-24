import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { scheduleMantraNotifications } from '@/utils/notifications';

export interface MantraSettings {
  mantra: string;
  additionalMantras: string[];
  scheduledMantras: Record<string, string>;
  timesPerDay: number;
  startHour: number;
  endHour: number;
  notificationsEnabled: boolean;
}

const STORAGE_KEY = 'mantra_settings';

const DEFAULT_SETTINGS: MantraSettings = {
  mantra: '',
  additionalMantras: [],
  scheduledMantras: {},
  timesPerDay: 5,
  startHour: 8,
  endHour: 21,
  notificationsEnabled: true,
};

export function getDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getMantraForDate(settings: MantraSettings, date: Date): string {
  const key = getDateKey(date);
  if (settings.scheduledMantras[key]) {
    return settings.scheduledMantras[key];
  }
  return settings.mantra;
}

export const [MantraProvider, useMantra] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<MantraSettings>(DEFAULT_SETTINGS);

  const settingsQuery = useQuery({
    queryKey: ['mantra_settings'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_SETTINGS, ...parsed } as MantraSettings;
      }
      return DEFAULT_SETTINGS;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (newSettings: MantraSettings) => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      return newSettings;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['mantra_settings'], data);
      const allMantras = [data.mantra, ...data.additionalMantras].filter(Boolean);
      scheduleMantraNotifications(
        allMantras,
        data.timesPerDay,
        data.startHour,
        data.endHour,
        data.notificationsEnabled,
      );
    },
  });

  useEffect(() => {
    if (settingsQuery.data) {
      setSettings(settingsQuery.data);
    }
  }, [settingsQuery.data]);

  const { mutate } = saveMutation;

  const updateSettings = useCallback(
    (partial: Partial<MantraSettings>) => {
      setSettings((prev) => {
        const updated = { ...prev, ...partial };
        mutate(updated);
        return updated;
      });
    },
    [mutate],
  );

  const addAdditionalMantra = useCallback(
    (mantra: string) => {
      setSettings((prev) => {
        const updated = {
          ...prev,
          additionalMantras: [...prev.additionalMantras, mantra],
        };
        mutate(updated);
        return updated;
      });
    },
    [mutate],
  );

  const removeAdditionalMantra = useCallback(
    (index: number) => {
      setSettings((prev) => {
        const updated = {
          ...prev,
          additionalMantras: prev.additionalMantras.filter((_, i) => i !== index),
        };
        mutate(updated);
        return updated;
      });
    },
    [mutate],
  );

  const updateAdditionalMantra = useCallback(
    (index: number, mantra: string) => {
      setSettings((prev) => {
        const newAdditional = [...prev.additionalMantras];
        newAdditional[index] = mantra;
        const updated = { ...prev, additionalMantras: newAdditional };
        mutate(updated);
        return updated;
      });
    },
    [mutate],
  );

  const setScheduledMantra = useCallback(
    (dateKey: string, mantra: string) => {
      setSettings((prev) => {
        const newScheduled = { ...prev.scheduledMantras };
        if (mantra.trim()) {
          newScheduled[dateKey] = mantra.trim();
        } else {
          delete newScheduled[dateKey];
        }
        const updated = { ...prev, scheduledMantras: newScheduled };
        mutate(updated);
        return updated;
      });
    },
    [mutate],
  );

  const removeScheduledMantra = useCallback(
    (dateKey: string) => {
      setSettings((prev) => {
        const newScheduled = { ...prev.scheduledMantras };
        delete newScheduled[dateKey];
        const updated = { ...prev, scheduledMantras: newScheduled };
        mutate(updated);
        return updated;
      });
    },
    [mutate],
  );

  return {
    settings,
    updateSettings,
    addAdditionalMantra,
    removeAdditionalMantra,
    updateAdditionalMantra,
    setScheduledMantra,
    removeScheduledMantra,
    isLoading: settingsQuery.isLoading,
    isSaving: saveMutation.isPending,
  };
});
