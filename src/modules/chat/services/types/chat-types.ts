export interface User {
  id: string
  name: string
  email: string
  avatar: string
  status: "online" | "away" | "offline"
  lastSeen: string
  role: string
  department: string
}

export interface Message {
  id: string
  content: string
  timestamp: string
  senderId: string
  type: "text" | "image" | "file"
  isEdited: boolean
  reactions: Array<{
    emoji: string
    users: string[]
    count: number
  }>
  replyTo: string | null
}

export interface Conversation {
  id: string
  type: "direct" | "group"
  participants: string[]
  name: string
  avatar: string
  lastMessage: {
    id: string
    content: string
    timestamp: string
    senderId: string
  }
  unreadCount: number
  isPinned: boolean
  isMuted: boolean
}
