import { User } from "./UserContext";

export interface ChatPreview {
  roomId: string;
  isGroup: boolean;
  groupName?: string;
  users?: User[];
  user?: User;
  message_count?: number | string;
  lastMessageAt?: string;
}
