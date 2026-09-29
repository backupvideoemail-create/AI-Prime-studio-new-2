import { AICharacter, ChatMessage } from '../../types';

export interface GenerateChatParams {
  character: AICharacter;
  messages: ChatMessage[];
  userPrompt: string;
}

export interface GenerateChatResult {
  success: boolean;
  text?: string;
  error?: string;
}

/**
 * Provider-agnostic chat service communicating with server-side /api/ai/chat
 */
export async function generateChat(params: GenerateChatParams): Promise<GenerateChatResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35000);

  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: data.error || 'Chat companion is taking a quick breath. Please message again in a moment.',
      };
    }

    return {
      success: true,
      text: data.text,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      return {
        success: false,
        error: 'Response took longer than expected. Please send your message again.',
      };
    }
    return {
      success: false,
      error: 'Unable to reach the studio AI engine. Please verify connection and retry.',
    };
  }
}
