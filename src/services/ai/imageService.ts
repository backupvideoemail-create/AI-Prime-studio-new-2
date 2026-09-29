export interface GenerateImageParams {
  prompt?: string;
  templateName?: string;
  imageBase64?: string;
  mimeType?: string;
  userId?: string;
}

export interface GenerateImageResult {
  success: boolean;
  imageUrl?: string;
  watermark?: string;
  creditsRemaining?: number;
  error?: string;
  code?: string;
}

/**
 * Provider-agnostic image generation/transformation service
 * Communicates strictly with server-side /api/ai/image/generate
 */
export async function generateImage(params: GenerateImageParams): Promise<GenerateImageResult> {
  // 60-second timeout controller
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const res = await fetch('/api/ai/image/generate', {
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
      if (res.status === 402 || res.status === 422 || res.status === 429 || res.status === 503) {
        return {
          success: false,
          error: data.error || 'AI generation is temporarily unavailable. Please try again.',
          code: data.code,
          creditsRemaining: data.creditsRemaining,
        };
      }
      return {
        success: false,
        error: data.error || 'Your image could not be processed. Please try another photo.',
        code: data.code,
      };
    }

    return {
      success: true,
      imageUrl: data.imageUrl,
      watermark: data.watermark || 'AI Club Photo Studio',
      creditsRemaining: data.creditsRemaining,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      return {
        success: false,
        error: 'Generation is taking longer than expected. Please check your connection and retry.',
      };
    }
    return {
      success: false,
      error: 'Network or server error encountered during AI generation. Please retry.',
    };
  }
}
