/**
 * Sends a text message to a Telegram user using the Telegram api.
 *
 * @param {string} _chatId -
 * @param {string} _text -
 */
const sendMessage = async(_chatId, _text) => {
  if (typeof _text !== 'string') throw new Error(`[sendMessage] _text argument was expected to be a string. Instead it\'s a ${typeof _text}`);
  if (_chatId === 'localtesting') return console.log(_text); // testing or using cli

  const url = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage?chat_id=${_chatId}&text=${_text}&parse_mode=Markdown`;
  console.log(url);
  return fetch(url)
    .catch((_err) => {
      console.log('Error sending message ' + _err.response.status + ' ' + _err.response.data);
    });
};

export const telegramWebhookController = (req, res) => {
  console.log('sendMessage');
  sendMessage(req.body.message.chat.id, 'Hey');
};
