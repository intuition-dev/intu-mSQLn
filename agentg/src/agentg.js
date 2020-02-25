#!/usr/bin/env node
"use strict";
// All rights reserved by INTUITION.DEV |  Cekvenich, licensed under LGPL 3.0
Object.defineProperty(exports, "__esModule", { value: true });
const commandLineArgs = require("command-line-args");
const SysAgent_1 = require("./lib/SysAgent");
const FileOpsExtra_1 = require("./lib/FileOpsExtra");
const gitdown_1 = require("./lib/gitdown");
const Agent_1 = require("./lib/Agent");
// imports done /////////////////////////////////////////////
const ver = "v1.2.15";
FileOpsExtra_1.VersionNag.isCurrent('agentg', ver).then(function (isCurrent_) {
    try {
        if (!isCurrent_)
            console.log('There is a newer version of agentg CLI, please update.');
    }
    catch (err) {
        console.log(err);
    }
}); // 
const cwd = process.cwd();
function version() {
    console.info('agentg CLI version: ' + ver);
}
function help() {
    console.info();
    console.info('agentg CLI version: ' + ver);
    console.info();
    console.info('Usage:');
    console.info('  List ports in use w/ process ID:                          agentg -p');
    console.info('  To start agent monitoring:                                agentg -s');
    console.info();
    console.info('  To download branch from git, in folder with gitdown.yaml: agentg -g');
    console.info();
    console.info(' Full docs: http://www.INTUITION.DEV');
    console.info();
}
// args: //////////////////////////////////////////////////////////////////////////////////////////////////////
const optionDefinitions = [
    { name: 'agentg', defaultOption: true },
    { name: 'help', alias: 'h', type: Boolean },
    { name: 'version', alias: 'v', type: Boolean },
    { name: 'gitDown', alias: 'g', type: Boolean },
    { name: 'ports', alias: 'p', type: Boolean },
    { name: 'start', alias: 's', type: Boolean },
];
const argsParsed = commandLineArgs(optionDefinitions);
let arg = argsParsed.agentg;
console.info();
// get folder to be processed: ///////////////////////////////////////////////////////////////////////////////////////////////////////
if (arg) {
    arg = FileOpsExtra_1.Dirs.slash(arg);
    if (arg.startsWith('/')) {
        //do nothing, full path is arg
    }
    else if (arg.startsWith('..')) { // few  cases to test
        arg = arg.substring(2);
        let d = cwd;
        d = FileOpsExtra_1.Dirs.slash(d);
        // find offset
        let n = d.lastIndexOf('/');
        d = d.substring(0, n);
        arg = d + arg;
    }
    else if (arg.startsWith('.')) { //cur
        arg = cwd;
    }
    else { // just plain, dir passed
        arg = cwd + '/' + arg;
    } // inner
} //outer
//  ////////////////////////////////////////////////////////////////////////////////////////////////
function start() {
    new Agent_1.Agent().runSmall();
}
async function ports() {
    let ports = await new SysAgent_1.SysAgent().ports();
    console.log(ports);
}
function git() {
    new gitdown_1.GitDown();
} //()
// start: ///////////////////////////////////////////////////////////////////////////////////// if (argsParsed.pug)
if (argsParsed.ports)
    ports();
else if (argsParsed.gitDown)
    git();
else if (argsParsed.start)
    start();
else if (argsParsed.version)
    version();
else
    help();
