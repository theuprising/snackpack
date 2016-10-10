/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Williams Medina @willyelm
*/
'use strict'
const util = require('loader-utils')
const pug = require('pug')

module.exports = function (source) {
  this.cacheable && this.cacheable()
  const query = util.parseQuery(this.query)
  const options = Object.assign({
    filename: this.resourcePath,
    doctype: query.doctype || 'js',
    compileDebug: this.debug || false
  }, query)
  const content = pug.compile(source, options)(query)
  return content
}
