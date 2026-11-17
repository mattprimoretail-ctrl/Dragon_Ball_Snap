// Dragon Ball Snap relay server. No dependencies. Run:  node snap-relay-server.js   (optional env: PORT)
// It only passes messages between the two players in a room. It never looks at game data.
const http = require('http'), crypto = require('crypto');
const PORT = process.env.PORT || 8787, MAX_MSG = 262144;
const rooms = new Map();          // code -> { host, guest, created }

const server = http.createServer((req, res) => { res.writeHead(200, { 'content-type': 'text/plain' }); res.end('Dragon Ball Snap relay OK'); });

function frame(str) {
  const p = Buffer.from(str), n = p.length; let h;
  if (n < 126) h = Buffer.from([0x81, n]);
  else if (n < 65536) { h = Buffer.alloc(4); h[0] = 0x81; h[1] = 126; h.writeUInt16BE(n, 2); }
  else { h = Buffer.alloc(10); h[0] = 0x81; h[1] = 127; h.writeBigUInt64BE(BigInt(n), 2); }
  return Buffer.concat([h, p]);
}
function send(ws, o) { try { if (!ws.destroyed) ws.write(frame(typeof o === 'string' ? o : JSON.stringify(o))); } catch (e) {} }
function control(ws, op, payload = Buffer.alloc(0)) { try { ws.write(Buffer.concat([Buffer.from([0x80 | op, payload.length]), payload])); } catch (e) {} }
function kill(ws) { try { control(ws, 8); ws.end(); } catch (e) {} setTimeout(() => { try { ws.destroy(); } catch (e) {} }, 500); }

function onMessage(ws, text) {
  ws.lastSeen = Date.now();
  const now = Date.now(); ws.win = (ws.win || []).filter(t => now - t < 1000); ws.win.push(now);
  if (ws.win.length > 250) return;                       // simple flood protection
  const room = rooms.get(ws.code); if (!room) return;
  const other = ws.role === 'host' ? room.guest : room.host;
  if (other) send(other, text);                         // forwarded exactly as received
}
function onClose(ws) {
  if (ws.closed) return; ws.closed = true;
  const room = rooms.get(ws.code); if (!room) return;
  if (ws.role === 'host') { if (room.guest) { send(room.guest, { t: 'peer', state: 'left' }); kill(room.guest); } rooms.delete(ws.code); }
  else if (room.guest === ws) { room.guest = null; if (room.host) send(room.host, { t: 'peer', state: 'left' }); }
}
function parse(ws) {
  for (;;) {
    const b = ws.buf; if (b.length < 2) return;
    const op = b[0] & 15, fin = b[0] & 128, masked = b[1] & 128; let len = b[1] & 127, off = 2;
    if (len === 126) { if (b.length < 4) return; len = b.readUInt16BE(2); off = 4; }
    else if (len === 127) { if (b.length < 10) return; len = Number(b.readBigUInt64BE(2)); off = 10; }
    if (len > MAX_MSG || !masked) return kill(ws);
    if (b.length < off + 4 + len) return;
    const mask = b.slice(off, off + 4), data = Buffer.from(b.slice(off + 4, off + 4 + len));
    for (let i = 0; i < data.length; i++) data[i] ^= mask[i & 3];
    ws.buf = b.slice(off + 4 + len);
    if (!fin || op === 0) return kill(ws);             // fragmented messages are not used by the game
    if (op === 8) { onClose(ws); return kill(ws); }
    if (op === 9) { control(ws, 10, data); continue; }
    if (op === 10) { ws.lastSeen = Date.now(); continue; }
    if (op === 1) onMessage(ws, data.toString('utf8'));
  }
}
server.on('upgrade', (req, socket) => {
  const url = new URL(req.url, 'http://x'), m = url.pathname.match(/^\/room\/([A-Z0-9]{4,8})$/), role = url.searchParams.get('role');
  const key = req.headers['sec-websocket-key'];
  if (!m || !key || (role !== 'host' && role !== 'guest')) { socket.destroy(); return; }
  const accept = crypto.createHash('sha1').update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
  socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + accept + '\r\n\r\n');
  const ws = socket; ws.code = m[1]; ws.role = role; ws.buf = Buffer.alloc(0); ws.lastSeen = Date.now(); socket.setNoDelay(true);
  let room = rooms.get(ws.code);
  if (role === 'host') {
    if (room) { send(ws, { t: 'err', msg: 'That room code is already in use' }); return kill(ws); }
    rooms.set(ws.code, { host: ws, guest: null, created: Date.now() });
    send(ws, { t: 'hello', role: 'host', code: ws.code });
  } else {
    if (!room || !room.host) { send(ws, { t: 'err', msg: 'Room not found. Check the code.' }); return kill(ws); }
    if (room.guest) { send(ws, { t: 'err', msg: 'That room already has two players' }); return kill(ws); }
    room.guest = ws; send(ws, { t: 'hello', role: 'guest', code: ws.code }); send(room.host, { t: 'peer', state: 'joined' });
  }
  socket.on('data', d => { ws.buf = Buffer.concat([ws.buf, d]); parse(ws); });
  socket.on('close', () => onClose(ws)); socket.on('error', () => onClose(ws));
});
setInterval(() => {                                    // keep connections alive and clear out dead rooms
  const now = Date.now();
  for (const [code, r] of rooms) for (const ws of [r.host, r.guest]) if (ws) {
    if (now - ws.lastSeen > 120000) { onClose(ws); kill(ws); } else control(ws, 9);
  }
  for (const [code, r] of rooms) if (now - r.created > 12 * 3600 * 1000) { for (const ws of [r.host, r.guest]) if (ws) kill(ws); rooms.delete(code); }
}, 30000);
if (require.main === module) server.listen(PORT, () => console.log('Dragon Ball Snap relay listening on port ' + PORT));
module.exports = { server, rooms };
