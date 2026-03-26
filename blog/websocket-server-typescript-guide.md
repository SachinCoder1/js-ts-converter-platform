---
title: "How to Build a WebSocket Server with TypeScript"
description: "Build a WebSocket server in TypeScript using Bun, Node.js (ws), or Deno. Covers typed messages, heartbeat, room patterns, and client reconnection."
date: "2026-03-26"
author: "SnipShift Team"
tags: ["websocket", "typescript", "bun", "nodejs", "deno"]
keyword: "websocket server typescript"
difficulty: "intermediate"
readTime: "8 min read"
tool: "/js-to-ts"
---

# How to Build a WebSocket Server with TypeScript

I built my first WebSocket server in 2019, and it was a mess. Untyped message events, string parsing everywhere, no idea what shape the data was supposed to be, clients silently disconnecting without the server noticing. The classic.

WebSockets are one of those things that sound simple  "just open a persistent connection"  but get complicated fast once you need typed messages, heartbeat detection, room-based broadcasting, and reconnection logic. And for whatever reason, most tutorials show you the happy path (open connection, send message, done!) and leave out the parts that actually matter in production.

This guide covers how to build a **WebSocket server with TypeScript** across all three major runtimes: Bun (the simplest), Node.js (with the `ws` package), and Deno. Plus the patterns you'll need regardless of runtime  typed messages, heartbeat, rooms, and client-side reconnection.

## Typed WebSocket Messages

Before we touch any runtime-specific code, let's solve the typing problem. WebSocket messages are strings (or binary). That means you're serializing and deserializing JSON, and without types, you're back to `JSON.parse()` and praying.

Here's a pattern I use on every WebSocket project:

```typescript
// shared/messages.ts
// This file is shared between server and client

type ChatMessage = {
  type: 'chat';
  payload: { userId: string; text: string; timestamp: number };
};

type JoinRoom = {
  type: 'join';
  payload: { roomId: string };
};

type LeaveRoom = {
  type: 'leave';
  payload: { roomId: string };
};

type UserTyping = {
  type: 'typing';
  payload: { userId: string; roomId: string };
};

// Union of all possible messages
export type ClientMessage = ChatMessage | JoinRoom | LeaveRoom | UserTyping;

export type ServerMessage =
  | { type: 'chat'; payload: { userId: string; text: string; timestamp: number } }
  | { type: 'userList'; payload: { users: string[] } }
  | { type: 'error'; payload: { message: string } };

// Type-safe send helper
export function parseMessage(raw: string): ClientMessage | null {
  try {
    const parsed = JSON.parse(raw);
    // You could add Zod validation here for runtime safety
    return parsed as ClientMessage;
  } catch {
    return null;
  }
}
```

The discriminated union pattern  where every message has a `type` field  lets TypeScript narrow the type inside a switch statement. This is the foundation everything else builds on.

## Bun: The Simplest WebSocket Server

Bun has native WebSocket support built into its HTTP server. No packages to install. If you're starting a new project and have the freedom to pick your runtime, this is the fastest path to a working **WebSocket server in TypeScript**.

```typescript
// server.ts (Bun)
import type { ClientMessage, ServerMessage } from './shared/messages';

type WebSocketData = {
  userId: string;
  rooms: Set<string>;
};

const server = Bun.serve<WebSocketData>({
  port: 3000,

  fetch(req, server) {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return new Response('Missing userId', { status: 400 });
    }

    // Upgrade HTTP to WebSocket
    const success = server.upgrade(req, {
      data: { userId, rooms: new Set() },
    });

    if (success) return undefined;
    return new Response('Upgrade failed', { status: 500 });
  },

  websocket: {
    open(ws) {
      console.log(`Connected: ${ws.data.userId}`);
    },

    message(ws, raw) {
      const msg = JSON.parse(String(raw)) as ClientMessage;

      switch (msg.type) {
        case 'chat':
          // Broadcast to everyone in the same room
          for (const roomId of ws.data.rooms) {
            server.publish(roomId, JSON.stringify({
              type: 'chat',
              payload: { ...msg.payload, userId: ws.data.userId },
            } satisfies ServerMessage));
          }
          break;

        case 'join':
          ws.data.rooms.add(msg.payload.roomId);
          ws.subscribe(msg.payload.roomId);
          break;

        case 'leave':
          ws.data.rooms.delete(msg.payload.roomId);
          ws.unsubscribe(msg.payload.roomId);
          break;
      }
    },

    close(ws) {
      console.log(`Disconnected: ${ws.data.userId}`);
      // Clean up room subscriptions
      for (const roomId of ws.data.rooms) {
        ws.unsubscribe(roomId);
      }
    },
  },
});

console.log(`WebSocket server running on ws://localhost:${server.port}`);
```

Bun's `server.publish()` and `ws.subscribe()` give you pub/sub rooms for free  no external library, no Redis, no managing arrays of connections manually. For most real-time features (chat rooms, collaborative editing, live dashboards), this is all you need.

Run it:

```bash
bun run server.ts
```

## Node.js: Using the ws Package

If you're on Node.js, the `ws` package is the standard. It's been around forever, it's battle-tested, and it works. But it's more verbose than Bun's built-in support.

```bash
npm install ws
npm install -D @types/ws
```

```typescript
// server.ts (Node.js)
import { WebSocketServer, WebSocket } from 'ws';
import type { ClientMessage, ServerMessage } from './shared/messages';

const wss = new WebSocketServer({ port: 3000 });

// Track rooms manually
const rooms = new Map<string, Set<WebSocket>>();

wss.on('connection', (ws, req) => {
  const url = new URL(req.url!, `http://localhost:3000`);
  const userId = url.searchParams.get('userId') ?? 'anonymous';
  const userRooms = new Set<string>();

  console.log(`Connected: ${userId}`);

  ws.on('message', (raw) => {
    const msg = JSON.parse(String(raw)) as ClientMessage;

    switch (msg.type) {
      case 'chat': {
        const response: ServerMessage = {
          type: 'chat',
          payload: { userId, text: msg.payload.text, timestamp: Date.now() },
        };
        // Broadcast to all rooms this user is in
        for (const roomId of userRooms) {
          const room = rooms.get(roomId);
          room?.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(response));
            }
          });
        }
        break;
      }

      case 'join': {
        const { roomId } = msg.payload;
        if (!rooms.has(roomId)) rooms.set(roomId, new Set());
        rooms.get(roomId)!.add(ws);
        userRooms.add(roomId);
        break;
      }

      case 'leave': {
        const { roomId } = msg.payload;
        rooms.get(roomId)?.delete(ws);
        userRooms.delete(roomId);
        break;
      }
    }
  });

  ws.on('close', () => {
    console.log(`Disconnected: ${userId}`);
    for (const roomId of userRooms) {
      rooms.get(roomId)?.delete(ws);
    }
  });
});

console.log('WebSocket server running on ws://localhost:3000');
```

Notice the main difference: in Node.js, you manage room membership manually with Maps and Sets. It's more code, but it also gives you more control. If you need to do things like limit room size or track who's in each room, the manual approach is actually easier to reason about.

> **Tip:** If you're converting an existing JavaScript WebSocket server to TypeScript, [SnipShift's JS to TypeScript converter](https://snipshift.dev/js-to-ts) can handle the initial migration  adding types to event handlers, properly typing the `ws` imports, and converting callback patterns.

## Deno: Native WebSocket with Deno.serve

Deno also has built-in WebSocket support, no packages needed:

```typescript
// server.ts (Deno)
import type { ClientMessage } from './shared/messages.ts';

Deno.serve({ port: 3000 }, (req) => {
  if (req.headers.get('upgrade') !== 'websocket') {
    return new Response('Expected WebSocket', { status: 426 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  const url = new URL(req.url);
  const userId = url.searchParams.get('userId') ?? 'anonymous';

  socket.onopen = () => {
    console.log(`Connected: ${userId}`);
  };

  socket.onmessage = (event) => {
    const msg = JSON.parse(event.data) as ClientMessage;
    // Handle messages same as above
    console.log(`${userId}: ${msg.type}`);
  };

  socket.onclose = () => {
    console.log(`Disconnected: ${userId}`);
  };

  return response;
});
```

Deno's approach is clean  upgrade the HTTP request, get a standard `WebSocket` object with familiar `onmessage`/`onclose` events. No external packages. But like Node.js, you'll need to manage rooms manually if you need them.

## Heartbeat / Ping-Pong

Here's something most tutorials skip: connections die silently. A user's Wi-Fi drops, a load balancer times out, a mobile device goes to sleep. The TCP connection stays "open" on your end even though the other side is gone. Without heartbeat, you end up with ghost connections that waste memory and cause phantom users in your room lists.

The fix is ping/pong:

```typescript
// Node.js example with ws
const HEARTBEAT_INTERVAL = 30_000; // 30 seconds
const CLIENT_TIMEOUT = 35_000;     // 5s grace period

wss.on('connection', (ws) => {
  let isAlive = true;

  ws.on('pong', () => {
    isAlive = true;
  });

  const heartbeat = setInterval(() => {
    if (!isAlive) {
      console.log('Client timed out, terminating');
      clearInterval(heartbeat);
      ws.terminate(); // Hard close  don't bother with close handshake
      return;
    }
    isAlive = false;
    ws.ping(); // Client should respond with pong automatically
  }, HEARTBEAT_INTERVAL);

  ws.on('close', () => {
    clearInterval(heartbeat);
  });
});
```

The server sends a `ping` every 30 seconds. The client automatically responds with `pong` (this is part of the WebSocket protocol  browsers do it natively). If the server doesn't receive a `pong` within the next interval, it terminates the connection.

In Bun, the same pattern works using `ws.ping()` and the `ping`/`pong` handlers in the websocket config.

## The Room/Channel Pattern

Here's a clean, runtime-agnostic abstraction for managing rooms:

```typescript
class RoomManager<T> {
  private rooms = new Map<string, Set<T>>();

  join(roomId: string, client: T): void {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId)!.add(client);
  }

  leave(roomId: string, client: T): void {
    this.rooms.get(roomId)?.delete(client);
    // Clean up empty rooms
    if (this.rooms.get(roomId)?.size === 0) {
      this.rooms.delete(roomId);
    }
  }

  getMembers(roomId: string): Set<T> {
    return this.rooms.get(roomId) ?? new Set();
  }

  broadcast(roomId: string, message: string, exclude?: T): void {
    // Implementation depends on runtime - ws.send() for Node, etc.
  }

  removeFromAll(client: T): void {
    for (const [roomId, members] of this.rooms) {
      members.delete(client);
      if (members.size === 0) this.rooms.delete(roomId);
    }
  }
}
```

This generic approach works with any WebSocket implementation. The `T` parameter is your socket type  `WebSocket` from `ws`, Bun's `ServerWebSocket`, or Deno's `WebSocket`.

## Client-Side Reconnection

The server is only half the story. On the client, you need to handle disconnections gracefully. Here's a reconnection wrapper with exponential backoff:

```typescript
// client.ts (runs in browser or Node)
function createReconnectingWebSocket(
  url: string,
  onMessage: (data: ServerMessage) => void
) {
  let ws: WebSocket | null = null;
  let retryCount = 0;
  const MAX_RETRIES = 10;

  function connect() {
    ws = new WebSocket(url);

    ws.onopen = () => {
      console.log('Connected');
      retryCount = 0; // Reset on successful connection
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data) as ServerMessage;
      onMessage(msg);
    };

    ws.onclose = (event) => {
      if (retryCount >= MAX_RETRIES) {
        console.error('Max retries reached, giving up');
        return;
      }
      // Exponential backoff: 1s, 2s, 4s, 8s... capped at 30s
      const delay = Math.min(1000 * 2 ** retryCount, 30_000);
      console.log(`Reconnecting in ${delay}ms (attempt ${retryCount + 1})`);
      retryCount++;
      setTimeout(connect, delay);
    };

    ws.onerror = () => {
      ws?.close(); // Triggers onclose, which handles reconnection
    };
  }

  connect();

  return {
    send: (msg: ClientMessage) => ws?.send(JSON.stringify(msg)),
    close: () => { retryCount = MAX_RETRIES; ws?.close(); },
  };
}
```

The exponential backoff is important. Without it, hundreds of clients reconnecting simultaneously after a server restart will DDoS your own infrastructure. Start at 1 second, double each time, cap at 30 seconds.

> **Warning:** Don't forget to handle the case where the user intentionally closes the tab. You don't want to reconnect if the close event was clean (code 1000). Check `event.code` and `event.wasClean` before scheduling a retry.

## Choosing Your Runtime

| Consideration | Bun | Node.js (ws) | Deno |
|--------------|-----|-------------|------|
| **Setup complexity** | None (built-in) | npm install ws | None (built-in) |
| **Pub/sub rooms** | Built-in | Manual | Manual |
| **Performance** | Excellent | Good | Good |
| **Ecosystem** | Growing | Massive | Growing |
| **Production maturity** | Newer | Battle-tested | Established |

If you're starting fresh and want the simplest path, Bun is hard to beat. If you need the stability and middleware ecosystem of Node.js, `ws` is the safe choice. Deno sits somewhere in between  clean API, no deps, but smaller community.

For more on handling async operations that come up in WebSocket servers  like processing multiple messages concurrently  our [Promise.all vs Promise.allSettled guide](/blog/promise-all-allsettled-race) covers the patterns that matter. And if you're building REST endpoints alongside your WebSocket server, our [REST API with TypeScript guide](/blog/rest-api-typescript-express-guide) pairs well with the patterns in this post.

Building a **WebSocket server with TypeScript** doesn't have to be complicated. Start with typed messages (the discriminated union pattern), add heartbeat from day one, and handle reconnection on the client. Those three things alone will save you from 90% of the bugs I've encountered in real-time applications. The runtime choice is secondary  pick what your team knows, and build from there.
