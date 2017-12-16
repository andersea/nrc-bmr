import BitMEXClient = require('bitmex-realtime-api');
import * as NodeRED from 'node-red';

import { IBitMEXRealtimeConfigNode } from './bitmex-common';

export = (RED: NodeRED.Red) => {
    RED.nodes.registerType('bitmex-config', function(
        this: IBitMEXRealtimeConfigNode,
        props: NodeRED.NodeProperties
    ) {
        RED.nodes.createNode(this, props);

        this.client = new BitMEXClient(props);

        this.client.on('error', (error: any) => {
            this.error('BitMEX Realtime API Error: ' + error);
        });

        this.on('close', () => {
            this.client.removeAllListeners();
        });
    });
};
