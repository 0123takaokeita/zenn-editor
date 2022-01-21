import type { Express } from 'express';
import { createServer } from 'http';
import type { Server as HttpServer } from 'http';
import websocket from 'ws';
import chokidar from 'chokidar';
import open from 'open';

type ServerOptions = {
  app: Express;
  port: number;
  shouldOpen: boolean;
};

export async function startServer({
  app,
  port,
  shouldOpen,
}: ServerOptions): Promise<HttpServer> {
  const server = createServer(app);

  return new Promise((resolve, reject) => {
    server
      .listen(port)
      .once('listening', function () {
        if (process.env.TS_NODE_DEV) {
          console.log('🚀 Server is ready.');
        } else {
          console.log(`👀 Preview: http://localhost:${port}`);
        }
        if (shouldOpen) open(`http://localhost:${port}`);
        resolve(server);
      })
      .once('error', async function (err) {
        if (err.message.includes('EADDRINUSE')) {
          console.log(
            `💡 ポート${port}は既に使用されています。別のポートで起動中…`
          );
          const server = await startServer({ app, shouldOpen, port: port + 1 });
          resolve(server);
        } else {
          reject(err);
        }
      });
  });
}

export async function startLocalChangesWatcher(
  server: HttpServer,
  watchPathGlob: string
) {
  const wss = new websocket.Server({ server });
  const watcher = await chokidar.watch(watchPathGlob);
  watcher.on('change', () => {
    wss.clients.forEach((client) => client.send('Should refresh'));
  });
  process.on('SIGINT', () => {
    // close by `Ctrl-C`
    wss.close();
    watcher.close();
    process.exit();
  });
}
