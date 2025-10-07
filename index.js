const { default: makeWASocket, useSingleFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { state, saveState } = useSingleFileAuthState('./session.json');
const qrcode = require('qrcode-terminal');

async function startBot() {
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true, // QR muncul di terminal
  });

  sock.ev.on('creds.update', saveState);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('Connection closed. Reconnecting...', shouldReconnect);
      if (shouldReconnect) startBot();
    } else if (connection === 'open') {
      console.log('✅ Bot sudah terhubung ke WhatsApp!');
    }
  });

  // auto-reply sederhana
  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text;

    console.log(`📩 Pesan dari ${from}: ${text}`);

    if (text?.toLowerCase() === 'halo') {
      await sock.sendMessage(from, { text: 'Hai juga! 👋 Saya bot Baileys sederhana.' });
    } else if (text?.toLowerCase() === 'menu') {
      await sock.sendMessage(from, { text: '📜 Menu Bot:\n1. halo\n2. menu\n3. info' });
    } else if (text?.toLowerCase() === 'info') {
      await sock.sendMessage(from, { text: '🤖 Bot Baileys by X Angel siap membantu!' });
    }
  });
}

startBot();
