import getPage from './get-page.js';
import {getLogger} from './logger.js';

const logger = getLogger(process.env.DEBUG && process.env.DEBUG !== '0')

const DEFAULT_CACHE_TIME = 60 * 60 // 60 minutes
const MIN_CACHE_TIME = 5 * 60 // 5 minutes

export default processRequest;

async function processRequest(req, res) {
  const startTime = new Date()
  const params = parseParams(req)

  if (params.requestMethod === 'OPTIONS') {
    return res.end()
  }

  const page = await getPage(params)

  return createResponse(page, params, res, startTime).then((resPage) => {
    logger.requestProcessed({
      format: params.format,
      headers: req.headers,
      status: {
        ...(typeof resPage.status !== 'object'
          ? {
              response_time: new Date() - startTime,
            }
          : resPage.status),
        url: params.url,
      },
    })
  })
}

function parseParams(req) {
  const params = {
    requestMethod: req.method,
    ...req.query,
    ...req.params,
  }
  params.requestMethod = parseRequestMethod(params.requestMethod)
  params.format = (params.format || 'json').toLowerCase()
  return params
}

function parseRequestMethod(method) {
  method = (method || '').toUpperCase()

  if (['HEAD', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'].includes(method)) {
    return method
  }
  return 'GET'
}

async function createResponse(page, params, res, startTime) {
  if (['GET', 'HEAD'].includes(params.requestMethod)) {
    const maxAge = params.disableCache
      ? 0
      : Math.max(
          MIN_CACHE_TIME,
          Number(params.cacheMaxAge) || DEFAULT_CACHE_TIME
        )

    res.set('Cache-control', `public, max-age=${maxAge}, stale-if-error=600`)
  }

  if (params.format === 'raw' && !(page.status || {}).error) {
    res.set({
      'Content-Length': page.contentLength,
      'Content-Type': page.contentType,
    })
    return res.send(page.content)
  }

  res.set(
    'Content-Type',
    `application/json; charset=${params.charset || 'utf-8'}`
  )

  if (page.status) {
    page.status.response_time = new Date() - startTime
  } else {
    page.response_time = new Date() - startTime
  }

  if (params.callback) {
    return res.jsonp(page)
  }
  let retString = ''
  let status = 200
  try {
    retString = JSON.stringify(page)
  }
  catch(err){
    console.log(err)
    status = 599
  }
  res.status(status).send(Buffer.from(retString))
  return page
}
