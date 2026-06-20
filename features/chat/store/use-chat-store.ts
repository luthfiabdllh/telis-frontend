import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ChatSession {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
}

interface ChatStore {
  isChatHistoryOpen: boolean
  toggleChatHistory: () => void
  setChatHistoryOpen: (isOpen: boolean) => void
  
  chatSessions: ChatSession[]
  setChatSessions: (sessions: ChatSession[]) => void
  
  selectedSessionId: string | null
  setSelectedSessionId: (id: string | null) => void
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      isChatHistoryOpen: true,
      toggleChatHistory: () => set((state) => ({ isChatHistoryOpen: !state.isChatHistoryOpen })),
      setChatHistoryOpen: (isOpen) => set({ isChatHistoryOpen: isOpen }),
      
      chatSessions: [],
      setChatSessions: (sessions) => set({ chatSessions: sessions }),
      
      selectedSessionId: null,
      setSelectedSessionId: (id) => set({ selectedSessionId: id }),
    }),
    {
      name: 'telis-chat-storage', // name of the item in the storage (must be unique)
      partialize: (state) => ({ isChatHistoryOpen: state.isChatHistoryOpen }), // only persist the toggle state
    }
  )
)
