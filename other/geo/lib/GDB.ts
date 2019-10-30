
const bunyan = require('bunyan')
const log = bunyan.createLogger({src: true, name: "class name"})

import { BaseDBL } from 'mbake/lib/BaseDBL'

const ipInt = require('ip-to-int')

export class GDB extends BaseDBL  {

   constructor() {
      super()

      this.schema()
   }//()

   private schema() {
      this.defCon(process.cwd(), '/dbip.db')

      const exists = this.tableExists('mon')
      if(exists) return

      log.info('.')
      // shard is ip for now, should be geocode
      // dt_stamp is timestamp of last change in GMT
      this.write(`CREATE TABLE geo( fromInt, first, last, cont,
         cou, state, city,
         lat, long
         ) `)

    }

   ins(p) {
      //log.info(Date.now(), params)

      const fromInt = ipInt(p['0'])

      this.write(`INSERT INTO geo( fromInt, first, last, cont,
            cou, state, city, 
            lat, long
         )
            VALUES
         ( ?,?,?,?.
           ?,?,?,
           ?,?
         )`
         ,
         fromInt, p['0'], p['1'], p['2'],
         p['3'], p['4'], p['5'],
         p['6'], p['7']
      )

   }//()

   /*
   SELECT longi, lat FROM fast
   WHERE 68257567 >= frm2 
   ORDER BY frm2 desc
   limit 1

   */
   showLastPerSecond(host?) {

      const rows = this.read(`SELECT datetime(dt_stamp, 'localtime') as local, * FROM mon
         ORDER BY host, dt_stamp DESC 
         LIMIT 60
         `)

      const sz = rows.length

      //first pass to get seconds, min and max
      let i
      const rows2 = {}
      for(i = sz -1; i >= 0; i-- ) {
         const row = rows[i]
         let date = new Date(row['local'])
         let seconds = Math.round(date.getTime() /1000)
         
         delete row['dt_stamp']
         delete row['guid']
         delete row['shard']
         
         rows2[seconds]=row
      }//for

      //log.info(rows2)
      return rows2
   }//()

   countMon() {
      const row = this.readOne(`SELECT count(*) as count FROM mon `)
      log.info(row)
   }


}//()
