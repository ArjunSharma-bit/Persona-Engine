import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io'
import { appLogger } from '../logger/logger.service';

@WebSocketGateway({
    cors: { origin: '*' }
})

export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    handleConnection(client: Socket) {
        appLogger.info(`Dashboard connected via Websocket: ${client.id}`)
    }

    handleDisconnect(client: Socket) {
        appLogger.info(`Dashboard Disconnected: ${client.id}`)
    }

    broadcastNewEvent(eventData: any) {
        this.server.emit('live_event', eventData)
    }

}