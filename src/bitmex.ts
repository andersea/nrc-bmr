import * as NodeRED from 'node-red';

import { IBitMEXRealtimeConfigNode } from './bitmex-common';

interface IBitMEXRealtimeNodeProperties extends NodeRED.NodeProperties {
    config: NodeRED.NodeId;
}

interface ISubscriptionMessage {
    topic: 'subscribe' | 'data';
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
                            this.send({
                                payload: data,
                                symbol,
                                topic: table,
                            });
                        }
                    );
                    break;
                case 'data':
                    this.send(
                        configNode.client.getData(
                            msg.payload.symbol,
                            msg.payload.table
                        )
                    );
                    break;
            }
        });
    });
};
