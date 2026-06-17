/**
 * TASK 3: TELEGRAM UTILITY (lib/telegram.ts)
 * Helper function to send messages to a Telegram Channel or User.
 */

export async function sendTelegramNotification(text: string, chatId?: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const channelId = process.env.TELEGRAM_CHANNEL_ID;

  if (!botToken) {
    console.warn('TELEGRAM_BOT_TOKEN is not defined in environment variables. Telegram notification bypassed.');
    return { success: false, error: 'TELEGRAM_BOT_TOKEN is undefined.' };
  }

  // Fallback to channel ID if chatId is absent
  const targetId = chatId || channelId;
  if (!targetId) {
    console.warn('Telegram target chatId / TELEGRAM_CHANNEL_ID is not configured. Telegram notification bypassed.');
    return { success: false, error: 'Target chatId unspecified.' };
  }

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: targetId,
        text: text,
        parse_mode: 'HTML'
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Telegram API request failed with status ${response.status}: ${errText}`);
      return { success: false, error: errText };
    }

    const json = await response.json();
    return { success: true, data: json };
  } catch (err: any) {
    console.error('Failed to dispatch telegram notification payload:', err);
    return { success: false, error: err?.message || 'Network error' };
  }
}
