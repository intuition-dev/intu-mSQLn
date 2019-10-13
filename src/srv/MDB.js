"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger = require('tracer').console();
const sqlite3 = require('sqlite3').verbose();
const BaseDBL_1 = require("mbake/lib/BaseDBL");
class MDB extends BaseDBL_1.BaseDBL {
    constructor() {
        super(null, null);
        this.db = new sqlite3.cached.Database(':memory:');
    }
    async schema() {
        await this._run(this.db.prepare(`CREATE TABLE mon ( guid, shard_g, load, dt DATETIME DEFAULT CURRENT_TIMESTAMP) `));
    }
    async ins(params) {
        let stmt = this.db.prepare(`INSERT INTO mon(guid, shard_g, load) VALUES( ?,?,?)`);
        await this._run(stmt, '1l23', 'us', 3);
        const qry = this.db.prepare(`SELECT * FROM mon `);
        const rows = await this._qry(qry);
        console.log(rows);
        console.log('OK');
        process.exit();
    }
}
exports.MDB = MDB;
MDB.uuid = require('uuid/v4');
