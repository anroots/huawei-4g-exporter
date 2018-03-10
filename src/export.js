'use strict'

const express = require('express')
const server = express()
const register = require('prom-client').register
const prom = require('prom-client')
const util = require('util')

const Metrics = require('./metrics.js')

// Configuration options via environment variables
const HUAWEI_GW_IP = process.env.HUAWEI_GW_IP
const HUAWEI_GW_USERNAME = process.env.HUAWEI_GW_USERNAME || 'admin'
const HUAWEI_GW_PASSWORD = process.env.HUAWEI_GW_PASSWORD.trim()
const SERVER_PORT = process.env.SERVER_PORT || 8080
const SERVER_HOST = process.env.SERVER_HOST || '0.0.0.0'

if (!HUAWEI_GW_IP || !HUAWEI_GW_USERNAME || !HUAWEI_GW_PASSWORD) {
  console.error('You need to specify HUAWEI_GW_IP, HUAWEI_GW_USERNAME and HUAWEI_GW_PASSWORD environment variables!')
  process.exit(1)
}

console.info('Starting huawei-4g-exporter')
console.info(util.format(
  'Running config: HUAWEI_GW_IP=%s; HUAWEI_GW_USERNAME=%s; HUAWEI_GW_PASSWORD=%s',
  HUAWEI_GW_IP,
  HUAWEI_GW_USERNAME,
  HUAWEI_GW_PASSWORD.replace(/./g, '*')
))

let router = require('dialog-router-api').create({
  gateway: HUAWEI_GW_IP
})

let token = null
let loggedIn = false

// Login to the Huawei gateway
router.getToken(function (error, routerToken) {
  if (error) {
    console.error(error)
    process.exit(1)
  }

  router.login(routerToken, HUAWEI_GW_USERNAME, HUAWEI_GW_PASSWORD, function (error, loginResponse) {
    if (error || loginResponse !== 'OK') {
      console.error('Unable to authenticate to the router, check router IP and credentials.')
      console.error(error)
      process.exit(1)
    }

    token = routerToken
    loggedIn = true
  })
})

function collectMetrics () {
  if (!loggedIn) {
    console.info('Not logged in to the router yet, waiting for login to succeed...')
    return
  }
  register.clear()
  const defaultLabels = {instance: HUAWEI_GW_IP}
  prom.register.setDefaultLabels(defaultLabels)

  let metrics = new Metrics(token, router)

  try {
    return metrics.fetchAll()
  } catch (e) {
    console.error(e)
  }
}

server.get('/metrics', function (req, res) {
  res.set('Content-Type', register.contentType)

  prom.collectDefaultMetrics()
  let metrics = collectMetrics()

  if (!metrics) {
    console.info('No metrics collected')
    res.end()
  }

  Promise.all(metrics).then(() => res.end(register.metrics()))
})

console.log(util.format('Server listening on %s:%s, metrics exposed on /metrics endpoint', SERVER_HOST, SERVER_PORT))
server.listen(SERVER_PORT, SERVER_HOST)
