// Связь между телефонами для версии на GitHub Pages: тот же интерфейс, что у «комнат» claude.ai
// (join → presence / onPeers / leave), но через публичный MQTT-брокер. Регистрация не нужна.
(function () {
  const BROKERS = window.MG_BROKERS || ['wss://broker.emqx.io:8084/mqtt', 'wss://broker.hivemq.com:8884/mqtt'];
  const PREFIX = 'moyaigra-v1-k7q2/';
  const rid = () => Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6);
  const me = rid();

  function connect(urls, opts) {
    return new Promise((resolve, reject) => {
      let i = 0;
      const tryNext = () => {
        if (i >= urls.length) return reject(new Error('no broker'));
        const c = window.mqtt.connect(urls[i++], opts);
        const t = setTimeout(() => { c.end(true); tryNext(); }, 7000);
        c.once('connect', () => { clearTimeout(t); resolve(c); });
      };
      tryNext();
    });
  }

  async function join(name) {
    const base = PREFIX + name + '/p/';
    const myTopic = base + me;
    let mine = {};
    const peers = new Map();
    const handlers = [];
    let first = true, sched = false, left = false;
    let pend = { joined: [], left: [], updated: [] };
    const mk = (peer, presence) => Object.freeze({ peer, presence: Object.freeze(presence), sameTab: peer === me, isMe: peer === me, by: null, kind: 'viewer', guest: false, updatedAt: Date.now() });
    peers.set(me, mk(me, {}));

    function fire() {
      if (sched) return;
      sched = true;
      setTimeout(() => {
        sched = false;
        const all = [...peers.values()];
        const ch = first ? { peers: all, joined: all, left: [], updated: [] } : { peers: all, ...pend };
        first = false;
        pend = { joined: [], left: [], updated: [] };
        handlers.forEach((h) => { try { h(ch); } catch (e) { console.error(e); } });
      }, 10);
    }

    const client = await connect(BROKERS, {
      clientId: 'mg_' + me + '_' + rid().slice(0, 4),
      clean: true, keepalive: 20, reconnectPeriod: 2000, connectTimeout: 7000,
      will: { topic: myTopic, payload: '', retain: true, qos: 1 },
    });

    const announce = () => client.publish(myTopic, JSON.stringify(mine), { retain: true, qos: 1 });
    client.on('connect', () => { client.subscribe(base + '+', { qos: 1 }); announce(); });
    client.subscribe(base + '+', { qos: 1 });
    announce();

    client.on('message', (topic, buf) => {
      if (!topic.startsWith(base)) return;
      const peer = topic.slice(base.length);
      if (peer === me) return;
      const txt = buf.toString();
      if (!txt) {
        const o = peers.get(peer);
        if (o) { peers.delete(peer); pend.left.push(o); fire(); }
        return;
      }
      let pr;
      try { pr = JSON.parse(txt); } catch (e) { return; }
      if (!pr || typeof pr !== 'object') return;
      const had = peers.has(peer);
      const o = mk(peer, pr);
      peers.set(peer, o);
      (had ? pend.updated : pend.joined).push(o);
      fire();
    });

    const bye = () => { try { client.publish(myTopic, '', { retain: true, qos: 0 }); } catch (e) { /* закрываемся */ } };
    addEventListener('pagehide', bye);

    return {
      name,
      presence(patch) {
        if (left) return Promise.reject({ code: 'invalid_argument', message: 'left' });
        mine = { ...mine };
        for (const k in patch) { if (patch[k] === null) delete mine[k]; else mine[k] = JSON.parse(JSON.stringify(patch[k])); }
        const o = mk(me, mine);
        peers.set(me, o);
        pend.updated.push(o);
        fire();
        announce();
        return Promise.resolve();
      },
      onPeers(h) { handlers.push(h); fire(); return () => { const i = handlers.indexOf(h); if (i >= 0) handlers.splice(i, 1); }; },
      peers: () => [...peers.values()],
      emit: () => Promise.resolve(),
      on: () => () => {},
      connected: () => client.connected,
      onConnection(h) { client.on('connect', () => h(true)); client.on('offline', () => h(false)); return () => {}; },
      leave() {
        left = true;
        removeEventListener('pagehide', bye);
        return new Promise((res) => client.publish(myTopic, '', { retain: true, qos: 1 }, () => { client.end(false, {}, res); }));
      },
    };
  }

  window.MG_BUILD = 'pages';
  window.MG_ROOM = () => (window.mqtt ? { join } : null);
})();
