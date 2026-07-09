export declare type BridgeMessageHandler = (msg: any) => void;

declare class Bridge {
  url: string;
  socket: WebSocket | null;
  messageHandlers: BridgeMessageHandler[];

  constructor(url?: string);

  connect(): void;
  disconnect(): void;

  onMessage(fn: BridgeMessageHandler): void;

  sendRaw(obj: any): Promise<void>;
  sendSequence(steps: Array<{ cmd: string; delay?: number }>): Promise<void>;

  stop(): void;

  ping(timeoutMs?: number): Promise<any>;
}

export default Bridge;
export { Bridge };
