/**
 * OpenAI API Integration Module
 * Handles communication with OpenAI's API including error handling,
 * retry logic, and timeout management.
 */

// Custom error classes for different error types
export class OpenAIAPIError extends Error {
  constructor(message, type, statusCode = null) {
    super(message);
    this.name = 'OpenAIAPIError';
    this.type = type;
    this.statusCode = statusCode;
  }
}

export class InvalidAPIKeyError extends OpenAIAPIError {
  constructor(message = 'Invalid API key provided') {
    super(message, 'invalid_api_key', 401);
    this.name = 'InvalidAPIKeyError';
  }
}

export class RateLimitError extends OpenAIAPIError {
  constructor(message = 'Rate limit exceeded') {
    super(message, 'rate_limit', 429);
    this.name = 'RateLimitError';
  }
}

export class NetworkError extends OpenAIAPIError {
  constructor(message = 'Network request failed') {
    super(message, 'network_error');
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends OpenAIAPIError {
  constructor(message = 'Request timeout exceeded') {
    super(message, 'timeout');
    this.name = 'TimeoutError';
  }
}

/**
 * Sleep helper for retry logic
 * @param {number} ms - Milliseconds to sleep
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Calculate exponential backoff delay
 * @param {number} attempt - Current retry attempt (0-indexed)
 * @returns {number} Delay in milliseconds
 */
const calculateBackoff = (attempt) => {
  const baseDelay = 1000; // 1 second
  const maxDelay = 10000; // 10 seconds
  const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  return delay;
};

/**
 * Make an API call to OpenAI with retry logic and timeout handling
 * @param {Object} config - Configuration object
 * @param {string} config.apiKey - OpenAI API key
 * @param {string} config.prompt - The prompt text to send (used as user message if systemPrompt not provided)
 * @param {string} [config.systemPrompt] - Optional system prompt (for separate system message)
 * @param {string} [config.model='gpt-3.5-turbo'] - Model to use
 * @param {number} [config.maxTokens=500] - Maximum tokens in response
 * @param {number} [config.temperature=0.7] - Temperature for generation
 * @param {number} [config.timeout=30000] - Timeout in milliseconds
 * @param {number} [config.maxRetries=3] - Maximum number of retries
 * @param {boolean} [config.forceJSON=false] - Force JSON mode (requires "json" in prompt)
 * @returns {Promise<string>} Generated text from the API
 * @throws {OpenAIAPIError} Various error types based on failure mode
 */
export async function generateText({
  apiKey,
  prompt,
  systemPrompt,
  model = 'gpt-3.5-turbo',
  maxTokens = 500,
  temperature = 0.7,
  timeout = 30000,
  maxRetries = 3,
  forceJSON = false,
}) {
  // Validate required parameters
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
    throw new InvalidAPIKeyError('API key is required and must be a non-empty string');
  }

  if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
    throw new OpenAIAPIError('Prompt is required and must be a non-empty string', 'invalid_input');
  }

  console.log('[OpenAI] Starting API call', {
    model,
    promptLength: prompt.length,
    maxTokens,
    temperature,
    timeout,
    maxRetries,
  });

  let lastError = null;

  // Retry loop with exponential backoff
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      console.log(`[OpenAI] Attempt ${attempt + 1}/${maxRetries + 1}`);

      // Build messages array (use separate system/user messages if systemPrompt provided)
      const messages = systemPrompt
        ? [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ]
        : [{ role: 'user', content: prompt }];

      // Build request body
      const requestBody = {
        model,
        messages,
        max_tokens: maxTokens,
        temperature,
      };

      // Add JSON mode if requested (requires "json" or "JSON" to appear in messages)
      if (forceJSON) {
        requestBody.response_format = { type: 'json_object' };
      }

      // Make the API call
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle different HTTP status codes
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || response.statusText;

        console.error('[OpenAI] API error', {
          status: response.status,
          message: errorMessage,
          attempt: attempt + 1,
        });

        if (response.status === 401) {
          throw new InvalidAPIKeyError(errorMessage);
        } else if (response.status === 429) {
          throw new RateLimitError(errorMessage);
        } else if (response.status >= 500) {
          throw new OpenAIAPIError(
            `API server error: ${errorMessage}`,
            'server_error',
            response.status
          );
        } else {
          throw new OpenAIAPIError(
            `API request failed: ${errorMessage}`,
            'api_error',
            response.status
          );
        }
      }

      // Parse successful response
      const data = await response.json();
      const generatedText = data.choices?.[0]?.message?.content;

      if (!generatedText) {
        throw new OpenAIAPIError(
          'Invalid response format: missing generated text',
          'invalid_response'
        );
      }

      console.log('[OpenAI] API call successful', {
        responseLength: generatedText.length,
        tokensUsed: data.usage,
      });

      // Return both text and usage data
      return {
        text: generatedText.trim(),
        usage: data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
      };
    } catch (error) {
      lastError = error;

      // Handle abort/timeout
      if (error.name === 'AbortError') {
        console.error('[OpenAI] Request timeout', { attempt: attempt + 1 });
        lastError = new TimeoutError(`Request exceeded ${timeout}ms timeout`);
      }

      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('[OpenAI] Network error', { attempt: attempt + 1, error: error.message });
        lastError = new NetworkError(error.message);
      }

      // Don't retry on certain errors
      const shouldNotRetry =
        lastError instanceof InvalidAPIKeyError ||
        (lastError instanceof OpenAIAPIError &&
          lastError.statusCode &&
          lastError.statusCode < 500 &&
          lastError.statusCode !== 429);

      if (shouldNotRetry) {
        console.error('[OpenAI] Non-retryable error, failing immediately', {
          errorType: lastError.name,
        });
        throw lastError;
      }

      // If we have retries left, wait with exponential backoff
      if (attempt < maxRetries) {
        const backoffDelay = calculateBackoff(attempt);
        console.log(`[OpenAI] Retrying after ${backoffDelay}ms...`);
        await sleep(backoffDelay);
      }
    }
  }

  // All retries exhausted
  console.error('[OpenAI] All retry attempts exhausted', {
    lastError: lastError?.message,
  });

  throw lastError || new OpenAIAPIError('Unknown error occurred', 'unknown');
}

/**
 * Test API key validity by making a minimal API call
 * @param {string} apiKey - OpenAI API key to test
 * @returns {Promise<boolean>} True if key is valid
 */
export async function testAPIKey(apiKey) {
  console.log('[OpenAI] testAPIKey starting...');
  try {
    const result = await generateText({
      apiKey,
      prompt: 'Say "test" and nothing else.',
      maxTokens: 10,
      maxRetries: 1,
      timeout: 30000, // Increased to 30 seconds
    });
    console.log('[OpenAI] testAPIKey success');
    return true;
  } catch (error) {
    console.log('[OpenAI] testAPIKey error:', error.name, error.message);
    if (error instanceof InvalidAPIKeyError) {
      return false;
    }
    // For other errors (network, timeout, etc), we can't determine key validity
    throw error;
  }
}

/**
 * Validate API key and throw descriptive errors
 * @param {string} apiKey - OpenAI API key to validate
 * @returns {Promise<void>} Resolves if valid, throws if invalid
 * @throws {Error} With user-friendly error messages
 */
export async function validateAPIKey(apiKey) {
  console.log('[OpenAI] validateAPIKey called');
  try {
    const isValid = await testAPIKey(apiKey);
    console.log('[OpenAI] testAPIKey result:', isValid);
    if (!isValid) {
      throw new Error('Invalid API key. Please check your OpenAI API key and try again.');
    }
  } catch (error) {
    console.log('[OpenAI] validateAPIKey error:', error.name, error.message);

    if (error instanceof InvalidAPIKeyError) {
      throw new Error('Invalid API key. Please check your OpenAI API key and try again.');
    } else if (error instanceof NetworkError) {
      throw new Error('Network error. Please check your internet connection and try again.');
    } else if (error instanceof TimeoutError) {
      throw new Error('Request timed out. Please try again.');
    } else if (error instanceof RateLimitError) {
      throw new Error('Rate limit exceeded. Please wait a moment and try again.');
    } else if (error instanceof OpenAIAPIError) {
      // Handle any other OpenAI API errors
      throw new Error(`API Error: ${error.message}`);
    } else {
      // Preserve the original error message for debugging
      console.error('[OpenAI] Unexpected error type:', error);
      throw new Error(error.message || 'Could not validate API key. Please try again.');
    }
  }
}
