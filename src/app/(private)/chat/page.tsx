"use client"

import { useEffect, useState } from "react"

import { Chat } from "@/modules/chat/components/chat"
import { getChatData } from "@/modules/chat/services/chat-services"
import { type Conversation, type Message, type User } from "@/modules/chat/services/types/chat-types"

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Record<string, Message[]>>({})
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const chatData = await getChatData()

        setConversations(chatData.conversations)
        setMessages(chatData.messages)
        setUsers(chatData.users)
      } catch (error) {
        console.error("Failed to load chat data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading chat...</div>
      </div>
    )
  }

  return (
    <div className="px-4 md:px-6">
      <Chat
        conversations={conversations}
        messages={messages}
        users={users}
      />
    </div>
  )
}
