import logger from '../../utils/logger.js';
import Client from '../client.js';

export default class WSClient extends Client {
  /**
   * Constructor
   * @param {ws.WebSocket} ws
   * @param id
   * @param socket
   * @param {WebSocketServer} server
   */
  constructor(id = 0, socket = null, server = null) {
    super(id, socket, server);

    socket.on('message', (data) => this.data(data));
  }
}
