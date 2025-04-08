/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { NestFactory } from '@nestjs/core';
import { createServer } from 'http';
import next from 'next';
import { Server } from 'socket.io';
import { AppModule } from 'src/app.module';
import { ChatGateway } from 'src/chat/chatgateway';
import { parse } from 'url';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const port = process.env.PORT || 3000;

app.prepare().then(async () => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server);

  // Instantiate the NestJS application
  const nestApp = await NestFactory.create(AppModule);

  // Inject io into ChatGateway
  const chatGateway = nestApp.get(ChatGateway);
  chatGateway.server = io;

  // Start the HTTP server and NestJS app
  server.listen(port, () => {
    console.log(`> Server listening at http://localhost:${port}`);
  });

  await nestApp.listen(port);
});
