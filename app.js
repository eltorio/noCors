/*!
 * AllOrigins
 * written by Gabriel Nunes <gabriel@multiverso.me>
 * http://github.com/gnuns
 */
import express from 'express';

import packageVersion from './package.json' assert {type: "json"};
// yep, global. it's ok
// https://softwareengineering.stackexchange.com/a/47926/289420
global.AO_VERSION = packageVersion.version

import processRequest from './app/process-request.js';

function enableCORS(req, res, next) {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*')
  res.header('Access-Control-Allow-Credentials', true)
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Content-Encoding, Accept'
  )
  res.header(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PATCH, PUT, DELETE'
  )
  res.header('Via', `noCors v${packageVersion.version}`)
  next()
}

export default (function app() {
  const app = express()

  app.set('case sensitive routing', false)
  app.set('jsonp callback name', 'callback')
  app.disable('x-powered-by')
  app.enable("trust proxy")
  app.use(enableCORS)

  app.all('/:format(get|raw|json|info)', processRequest)

  return app
}());
