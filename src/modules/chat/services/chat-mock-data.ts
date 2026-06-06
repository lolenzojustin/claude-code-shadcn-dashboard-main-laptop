import conversationsData from "./data/conversations.json"
import messagesData from "./data/messages.json"
import usersData from "./data/users.json"

import type { Conversation, Message, User } from "./types/chat-types"

export const chatMockData = {
  conversations: conversationsData as Conversation[],
  messages: messagesData as Record<string, Message[]>,
  users: usersData as User[],
}
