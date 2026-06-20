/** Public RabbitMQ connection API — implementations live in sibling modules. */
export { connectRabbitMq } from "./connect.js";
export { retryRabbitConnection } from "./reconnect.js";
export {
  closeRabbitConnection,
  getRabbitChannel,
  setRabbitReconnectHandler,
} from "./state.js";

import "./reconnect.js";
