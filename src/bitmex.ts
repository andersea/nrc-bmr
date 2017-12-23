import * as NodeRED from 'node-red';

import { IBitMEXRealtimeConfigNode } from './bitmex-common';

interface IBitMEXRealtimeNodeProperties extends NodeRED.NodeProperties {
    config: NodeRED.NodeId;
}

interface ISubscriptionMessage {
    topic: 'subscribe' | 'get';
    payload: {
        symbol?: string;
        table?: string;
    };
}

export = (RED: NodeRED.Red) => {
    RED.nodes.registerType('bitmex-realtime', function(
        this: NodeRED.Node,
        props: IBitMEXRealtimeNodeProperties
    ) {
        RED.nodes.createNode(this, props);

        const configNode = RED.nodes.getNode(
            props.config
        ) as IBitMEXRealtimeConfigNode;
        if (!(configNode && configNode.client)) {
            return this.error('Connection not configured');
        }

        this.on('input', (msg: ISubscriptionMessage) => {
            switch (msg.topic) {
                case 'subscribe':
                    configNode.client.addStream(
                        msg.payload.symbol,
                        msg.payload.table,
                        (data: any, symbol: string, table: string) => {
                            Array.isArray(data) && data.length === 1
                                ? this.send({
                                      payload: data[0],
                                      symbol,
                                      topic: table,
                                  })
                                : this.send({
                                      payload: data,
                                      symbol,
                                      topic: table,
                                  });
                        }
                    );
                    break;
                case 'get':
                    try {
                        const data = configNode.client.getData(
                            msg.payload.symbol,
                            msg.payload.table
                        );
                        (msg as any).topic = msg.payload.table;
                        (msg as any).symbol = msg.payload.symbol;
                        Array.isArray(data) && data.length === 1
                            ? (msg.payload = data[0])
                            : (msg.payload = data);
                        this.send(msg);
                    } catch (error) {
                        this.error('Get data error: ' + error, msg);
                    }
                    break;
                default:
                    this.error('Unknown message type', msg);
            }
        });
    });
};
