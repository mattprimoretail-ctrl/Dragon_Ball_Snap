// Dragon Ball Snap relay for Cloudflare Workers (free plan, always on). Passes messages between the two players in a room.
export class Room {
  constructor(state, env) { this.host = null; this.guest = null; }
  async fetch(request) {
    if (request.headers.get('Upgrade') !== 'websocket') return new Response('Expected websocket', { status: 426 });
    const url = new URL(request.url);
    const role = url.searchParams.get('role');
    const code = url.pathname.split('/').pop();
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    server.accept();
    const send = (ws, o) => { try { ws.send(typeof o === 'string' ? o : JSON.stringify(o)); } catch (e) {} };
    const fail = msg => { send(server, { t: 'err', msg }); setTimeout(() => { try { server.close(1000, 'bye'); } catch (e) {} }, 300); };
    if (role === 'host') {
      if (this.host) { fail('That room code is already in use'); return new Response(null, { status: 101, webSocket: client }); }
      this.host = server; send(server, { t: 'hello', role: 'host', code });
    } else if (role === 'guest') {
      if (!this.host) { fail('Room not found. Check the code.'); return new Response(null, { status: 101, webSocket: client }); }
      if (this.guest) { fail('That room already has two players'); return new Response(null, { status: 101, webSocket: client }); }
      this.guest = server; send(server, { t: 'hello', role: 'guest', code }); send(this.host, { t: 'peer', state: 'joined' });
    } else { return new Response('Bad role', { status: 400 }); }
    let times = [];
    server.addEventListener('message', e => {
      const now = Date.now(); times = times.filter(t => now - t < 1000); times.push(now);
      if (times.length > 250 || (typeof e.data === 'string' && e.data.length > 262144)) return;
      const other = role === 'host' ? this.guest : this.host;
      if (other) send(other, e.data);
    });
    const gone = () => {
      if (role === 'host') { if (this.host === server) { if (this.guest) { send(this.guest, { t: 'peer', state: 'left' }); try { this.guest.close(1000, 'host left'); } catch (e) {} } this.host = null; this.guest = null; } }
      else if (this.guest === server) { this.guest = null; if (this.host) send(this.host, { t: 'peer', state: 'left' }); }
    };
    server.addEventListener('close', gone); server.addEventListener('error', gone);
    return new Response(null, { status: 101, webSocket: client });
  }
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const m = url.pathname.match(/^\/room\/([A-Z0-9]{4,8})$/);
    if (!m) return new Response('Dragon Ball Snap relay OK', { headers: { 'content-type': 'text/plain' } });
    return env.ROOM.get(env.ROOM.idFromName(m[1])).fetch(request);
  }
};
