// All rights reserved by Cekvenich|INTUITION.DEV) |  Cekvenich, licensed under LGPL 3.0

const bunyan = require('bunyan')
const bformat = require('bunyan-format2')  
const formatOut = bformat({ outputMode: 'short' })

import fs = require('fs-extra')

import AdmZip = require('adm-zip')
import download = require('download')
import yaml = require('js-yaml')

//
import path = require("path")
import FileHound = require('filehound')

export class DownloadC {
   _log = bunyan.createLogger({src: true, stream: formatOut, name: this.constructor.name })

   // in docs root via git
   static truth: string = 'https://INTUITION-dev.github.io/mbCLI/versions.yaml'
   key: string
   targetDir: string

   constructor(key_: string, targetDir_: string) {
      this.key = key_
      this.targetDir = targetDir_
   }// cons

   autoUZ() { // and unzip
      const THIZ = this
      this.getVal().then(function (url: string) {
         THIZ._log.info(url)
         const fn = THIZ.getFn(url)
         THIZ._log.info(fn)
         THIZ.down(url, fn).then(function () {
            THIZ.unzip(fn)
         })
      })
   }

   auto() {
      const THIZ = this
      this.getVal().then(function (url: string) {
         const fn = THIZ.getFn(url)
         THIZ.down(url, fn)
      })
   }

   checkVer(lver): Promise<boolean> {
      const THIZ = this
      return new Promise(function (resolve, reject) {
         THIZ.getVal().then(function (ver: string) {
            //log.info(ver, lver)
            if (ver == lver) resolve(true)
            else resolve(false)
         })
      })//pro
   }

   getVal() { // from truth
      const THIZ = this
      return new Promise(function (resolve, reject) {
         download(DownloadC.truth).then(data => {
            let dic = yaml.load(data)
            resolve(dic[THIZ.key])
         }).catch(err => {
            THIZ._log.info('err: where is the vfile?', err, DownloadC.truth)
         })
      })//pro
   }//()
   getFn(url: string): string {
      const pos = url.lastIndexOf('/')
      return url.substring(pos)
   }
   down(url, fn) {
      const THIZ = this
      return new Promise(function (resolve, reject) {
         download(url).then(data => {
            fs.writeFileSync(THIZ.targetDir + '/' + fn, data)
            THIZ._log.info('downloaded')
            resolve('OK')
         }).catch(err => {
            THIZ._log.info('err: where is the file?', err, url)
         })
      })//pro
   }//()
   unzip(fn) {
      const zfn = this.targetDir + fn
      this._log.info(zfn)
      const zip = new AdmZip(zfn)
      zip.extractAllTo(this.targetDir, /*overwrite*/true)
      fs.remove(this.targetDir + '/' + fn)
   }
}//class

// //////////////////////////////////////////////////////////////////////////////////////////////////////////////
export class YamlConfig {
   _log = bunyan.createLogger({src: true, stream: formatOut, name: this.constructor.name })

   constructor(fn) {
      let cfg = yaml.load(fs.readFileSync(fn))
      this._log.info(cfg)
      return cfg
   }//()
}//class

export class DownloadFrag {
   _log = bunyan.createLogger({src: true, stream: formatOut, name: this.constructor.name })

   constructor(dir, ops: boolean) {
      this._log.info('Extracting to', dir)
      if (!ops) {
         new DownloadC('headFrag',dir).auto()
         new DownloadC('VM',  dir).auto()
         new DownloadC('Tests',  dir).auto()
         new DownloadC('Bind',  dir).auto()
      }
      if (ops) {
         new DownloadC('opsPug', dir).auto()
         new DownloadC('opsJs',  dir).auto()
      }//fi
   }//()
}

export class VersionNag {
   _log = bunyan.createLogger({src: true, stream: formatOut, name: this.constructor.name })

   static isCurrent(prod, ver): Promise<boolean> {
      const down = new DownloadC(prod, null)
      return down.checkVer(ver)
   }
}

export class Dirs {
   _log = bunyan.createLogger({src: true, stream: formatOut, name: this.constructor.name })

   dir: string
   constructor(dir_: string) {
      let dir = Dirs.slash(dir_)
      this.dir = dir
   }
   static slash(path_) {// windowze
      return path_.replace(/\\/g, '/')
   }
   static goUpOne(dir): string {
      return path.resolve(dir, '..')
   }

   getInDir(sub):any {
      this._log.info('method renamed use getFilesIn')
      return this.getFilesIn(sub)
   }
   getFilesIn(sub) {
      const rec = FileHound.create() //recursive
         .paths(this.dir + sub)
         .findSync()

      let ret: string[] = [] //empty string array
      const ll = this.dir.length + sub.length
      for (let s of rec) {//clean the strings

         let n = s.substr(ll)

         ret.push(n)
      }
      return ret
   }

   /**
    * Get list of dirs w/o root part
    */
   getShort() {
      let lst = this.getFolders()
      let ret: string[] = [] //empty string array
      const ll = this.dir.length

      for (let s of lst) {//clean the strings
         let n = s.substr(ll)
         //log.(n)
         ret.push(n)
      }
      return ret
   }

   getFolders() {
      const rec = FileHound.create() //recursive
         .paths(this.dir)
         .findSync()
      let ret: string[] = [] //empty string array
      for (let val of rec) {//clean the strings
         val = Dirs.slash(val)
         let n = val.lastIndexOf('/')
         let s: string = val.substring(0, n)
         ret.push(s)
      }

      return Array.from(new Set(ret))
   }//()
}//class


module.exports = {
 DownloadFrag, YamlConfig, DownloadC, VersionNag, Dirs
}
