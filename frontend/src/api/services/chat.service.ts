/**
 * Chat Service
 * API methods for chat functionality
 */

import { apiClient } from '../base/client';
import { BaseResponse } from '../base/types';

/**
 * Chat message response data
 */
export type ChatMessageResponse = string;

/**
 * Chat Service
 * Handles all chat-related API calls
 */
export class ChatService {
    /**
     * Send a chat message and get a reply
     * @param message - The message to send
     * @returns Promise with the AI reply
     */
    async sendMessage(message: string): Promise<BaseResponse<ChatMessageResponse>> {
        // The backend expects the message as a query parameter
        const response = await apiClient.post<ChatMessageResponse>(
            '/chat',
            null,
            {
                params: { message },
            }
        );

        return response;
    }

    /**
     * Get just the reply data without the full response wrapper
     * @param message - The message to send
     * @returns Promise with just the reply string
     */
    async getReply(message: string): Promise<string> {
        const response = await this.sendMessage(message);
        return response.data || '';
    }
}

// Export singleton instance
export const chatService = new ChatService();

// Export the class for testing or custom instances
export default ChatService;
