export async function logClientError(
  message: string,
  error?: Error,
  metadata?: Record<string, any>
) {
  try {
    await fetch('/api/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        level: 'error',
        message,
        error: error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : undefined,
        metadata: {
          ...metadata,
          source: 'client',
          url: window.location.href,
          userAgent: navigator.userAgent,
        },
      }),
    });
  } catch (logError) {
    // biome-ignore lint/suspicious/noConsole: ignore
    console.error('Failed to log error to server:', logError);
  }
}
