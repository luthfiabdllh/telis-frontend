import { create } from 'zustand';

export type AiServiceType = 'chat' | 'redlining' | null;

interface AiServiceState {
  activeService: AiServiceType;
  isOpen: boolean;
  setActiveService: (service: AiServiceType) => void;
  closeService: () => void;
  toggleService: (service: AiServiceType) => void;
}

export const useAiServiceStore = create<AiServiceState>((set, get) => ({
  activeService: null,
  isOpen: false,
  setActiveService: (service) => set({ activeService: service, isOpen: true }),
  closeService: () => set({ isOpen: false, activeService: null }),
  toggleService: (service) => {
    const { activeService, isOpen } = get();
    if (activeService === service && isOpen) {
      set({ isOpen: false, activeService: null });
    } else {
      set({ activeService: service, isOpen: true });
    }
  },
}));
