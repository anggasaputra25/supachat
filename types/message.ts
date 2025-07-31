export type TMessage = {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  deleted_at: string;
  isSender?: boolean; // Optional UI flag for rendering purposes
};
