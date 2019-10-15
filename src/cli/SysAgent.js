"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var logger = require('tracer').console();
const Invoke_1 = require("./Invoke");
class SysAgent {
    async ping() {
        logger.trace('ping:->');
        const track = new Object();
        track['guid'] = SysAgent.guid();
        track['dt_stamp'] = new Date().toISOString();
        await SysAgent.si.fsStats().then(data => {
            track['fsR'] = data.rx;
            track['fsW'] = data.wx;
        });
        await SysAgent.si.disksIO().then(data => {
            track['ioR'] = data.rIO;
            track['ioW'] = data.wIO;
        });
        await SysAgent.si.fsOpenFiles().then(data => {
            track['openMax'] = data.max;
            track['openAlloc'] = data.allocated;
        });
        let nic;
        await SysAgent.si.networkInterfaceDefault().then(data => {
            nic = data;
            logger.trace('nic', data);
        });
        await SysAgent.si.networkStats(nic).then(function (data) {
            const dat = data[0];
            track['nicR'] = dat.rx_bytes;
            track['nicT'] = dat.tx_bytes;
        });
        await SysAgent.si.mem().then(data => {
            track['memFree'] = data.free;
            track['memUsed'] = data.used;
            track['swapUsed'] = data.swapused;
            track['swapFree'] = data.swapfree;
        });
        await SysAgent.si.currentLoad().then(data => {
            track['cpu'] = data.currentload;
            track['cpuIdle'] = data.currentload_idle;
        });
        track['host'] = SysAgent.os.hostname();
        await SysAgent.rpc.invoke('monitor', 'monitor', 'monitor', track);
        await logger.trace('<-', JSON.stringify(track));
        await this.wait(2000);
        this.ping();
    }
    wait(t) {
        return new Promise((resolve, reject) => {
            setTimeout(function () {
                logger.trace('.');
                resolve();
            }, t);
        });
    }
    async info() {
        logger.trace('info');
        await SysAgent.si.services('node, pm2, caddy').then(data => {
            for (let o of data)
                delete o['startmode'];
        });
        SysAgent.si.networkConnections().then(data => logger.trace(data));
        SysAgent.si.processes().then(data => logger.trace(data));
        SysAgent.si.networkInterfaces().then(data => logger.trace(data));
        SysAgent.si.fsSize().then(data => logger.trace(data));
        SysAgent.si.blockDevices().then(data => logger.trace(data));
        SysAgent.si.osInfo().then(data => logger.trace(data));
        SysAgent.si.users().then(data => logger.trace(data));
    }
}
exports.SysAgent = SysAgent;
SysAgent.guid = require('uuid/v4');
SysAgent.si = require('systeminformation');
SysAgent.os = require('os');
SysAgent.rpc = new Invoke_1.httpRPC('http', 'localhost', 8888);
