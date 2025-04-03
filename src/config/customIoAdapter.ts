import { INestApplication } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, ServerOptions } from 'socket.io';

export class CustomIoAdapter extends IoAdapter {
  constructor(private app: INestApplication) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions): Server {
    const corsOptions: Partial<ServerOptions> = {
      cors: {
        origin: ['https://it-experts-nine.vercel.app', 'http://localhost:3000'],
        methods: ['GET', 'POST'],
        credentials: true,
      },
    };

    const server = super.createIOServer(port, {
      ...options,
      ...corsOptions,
    }) as Server;
    return server;
  }
}
