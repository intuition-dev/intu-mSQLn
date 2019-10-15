
const URL = require('url')

var logger = require('tracer').console()

// from mbake
import { BaseRPCMethodHandler, ExpressRPC } from "mbake/lib/Serv"
import { MDB } from "./srv/MDB"

const m = new MDB()
m.schema()


const serviceApp = new ExpressRPC()
serviceApp.makeInstance(['*'])

const handler = new BaseRPCMethodHandler()
serviceApp.routeRPC('monitor', 'monitor', (req, res) => { 

   const params = URL.parse(req.url, true).query
   params['ip'] = req.ip // you may need req.ips
   
   m.ins(params)

   handler.ret(res, 'OK', 0, 0)
})
serviceApp.listen(8888)


// client
import { SysAgent } from './cli/SysAgent'

const sa = new SysAgent()
sa.ping()
