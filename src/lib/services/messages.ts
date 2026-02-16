import { supabase } from '@/lib/supabase/client'
import type { Message, Conversation } from '@/lib/types/database.types'

export async function getConversations(userId: string) {
  // TODO: Conversations table doesn't exist in current schema
  // This returns empty array as a temporary placeholder
  console.warn('getConversations: conversations table not implemented')
  return [] as Conversation[]
}

export async function getMessagesByConversation(conversationId: string, limit = 50) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data || []).reverse() as Message[]
}

export async function getMessagesBetweenUsers(userId1: string, userId2: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []).reverse() as Message[]
}

export async function sendMessage(senderId: string, receiverId: string, content: string) {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      content: content,
      is_read: false,
    } as any)
    .select('*')
    .single()

  if (error) throw error
  return data as Message
}

export async function markAsRead(messageId: string) {
  const result = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('id', messageId)

  if (result.error) throw result.error
}

export async function getUnreadCount(userId: string) {
  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('receiver_id', userId)
    .eq('is_read', false)

  if (error) throw error
  return count || 0
}

export async function createOrGetConversation(userId: string, vendorId: string) {
  // TODO: Conversations table doesn't exist in current schema
  // This returns mock data as a temporary placeholder until the table is created
  console.warn('createOrGetConversation: conversations table not implemented, returning mock data')
  return {
    id: `${userId}-${vendorId}`,
    user_id: userId,
    vendor_id: vendorId,
    unread_count: 0,
    last_message_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  } as Conversation
}
