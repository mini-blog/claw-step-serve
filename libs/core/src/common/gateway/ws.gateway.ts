import { UseGuards } from "@nestjs/common";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WsResponse, OnGatewayDisconnect } from "@nestjs/websockets";
import { Socket } from "dgram";
import { JwtAuthGuard } from "../guards/auth.guard";

@WebSocketGateway(3001)
@UseGuards(JwtAuthGuard)
export class WsStartGateway implements OnGatewayDisconnect {
  constructor(
  ) { }

  userMap: Map<string | Socket, Socket | string> = new Map();

  @SubscribeMessage('link')
  link(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    this.userMap.set(data.uid, client);
    this.userMap.set(client, data.uid);
  }

  @SubscribeMessage('ping')
  ping(): WsResponse<unknown> {
    return {
      event: 'pong',
      data: null,
    };
  }

  @SubscribeMessage('post')
  send(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ): WsResponse<unknown> {
    return {
      event: "post",
      data: {
        msg: 'ws收到信息后返回'
      },
    };
  }

  handleDisconnect(client) {
    const uid = this.userMap.get(client);
    if (uid) {
      this.userMap.delete(uid)
      this.userMap.delete(client)
    }
  }

}
