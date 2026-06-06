"use client"

import { getFirestoreCollection } from "@/lib/firebase/firestore-query"

import { create } from "zustand"
import { chatMockData } from "./chat-mock-data"
import type { Conversation, Message, User } from "./types/chat-types"

type StoredMessage = Message & {
  conversationId: string
}

function flattenMessages(messages: Record<string, Message[]>): StoredMessage[] {
  return Object.entries(messages).flatMap(([conversationId, conversationMessages]) =>
    conversationMessages.map((message) => ({
      ...message,
      conversationId,
    }))
  )
}

function groupMessages(messages: StoredMessage[]): Record<string, Message[]> {
  return messages.reduce<Record<string, Message[]>>((accumulator, message) => {
    const { conversationId, ...messageData } = message

    accumulator[conversationId] = [...(accumulator[conversationId] || []), messageData]

    return accumulator
  }, {})
}

export async function getChatData() {
  const [conversations, messages, users] = await Promise.all([
    getFirestoreCollection<Conversation>("conversations", chatMockData.conversations),
    getFirestoreCollection<StoredMessage>("messages", flattenMessages(chatMockData.messages)),
    getFirestoreCollection<User>("chatUsers", chatMockData.users),
  ])

  return {
    conversations,
    messages: groupMessages(messages),
    users,
  }
}

interface ChatState {
  conversations: Conversation[]
  messages: Record<string, Message[]>
  users: User[]
  selectedConversation: string | null
  searchQuery: string
  isTyping: Record<string, boolean>
  onlineUsers: string[]
}

interface ChatActions {
  setConversations: (conversations: Conversation[]) => void
  setMessages: (conversationId: string, messages: Message[]) => void
  setUsers: (users: User[]) => void
  setSelectedConversation: (conversationId: string | null) => void
  setSearchQuery: (query: string) => void
  addMessage: (conversationId: string, message: Message) => void
  markAsRead: (conversationId: string) => void
  togglePin: (conversationId: string) => void
  toggleMute: (conversationId: string) => void
  setTyping: (conversationId: string, isTyping: boolean) => void
  setOnlineUsers: (userIds: string[]) => void
}

export const useChat = create<ChatState & ChatActions>((set, get) => ({
  // State
  conversations: [],
  messages: {},
  users: [],
  selectedConversation: null,
  searchQuery: "",
  isTyping: {},
  onlineUsers: [],

  // Actions
  setConversations: (conversations) => set({ conversations }),
  
  setMessages: (conversationId, messages) => 
    set((state) => ({
      messages: { ...state.messages, [conversationId]: messages }
    })),
  
  setUsers: (users) => set({ users }),
  
  setSelectedConversation: (conversationId) => {
    set({ selectedConversation: conversationId })
    if (conversationId) {
      get().markAsRead(conversationId)
    }
  },
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  addMessage: (conversationId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [...(state.messages[conversationId] || []), message]
      },
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId
          ? {
              ...conv,
              lastMessage: {
                id: message.id,
                content: message.content,
                timestamp: message.timestamp,
                senderId: message.senderId
              }
            }
          : conv
      )
    })),
  
  markAsRead: (conversationId) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
      )
    })),
  
  togglePin: (conversationId) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId ? { ...conv, isPinned: !conv.isPinned } : conv
      )
    })),
  
  toggleMute: (conversationId) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId ? { ...conv, isMuted: !conv.isMuted } : conv
      )
    })),
  
  setTyping: (conversationId, isTyping) =>
    set((state) => ({
      isTyping: { ...state.isTyping, [conversationId]: isTyping }
    })),
  
  setOnlineUsers: (userIds) => set({ onlineUsers: userIds }),
}))

export type { Conversation, Message, User }
