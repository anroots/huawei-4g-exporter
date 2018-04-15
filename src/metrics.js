'use strict'

const Gauge = require('prom-client').Gauge

class Metrics {
  constructor (token, router) {
    this.token = token
    this.router = router
  }

  static asInt (property) {
    return parseInt(property[0]) || -1
  }

  fetchAll () {
    return [
      this.getBasicSettings(),
      this.getMonthStatistics(),
      this.getSignal(),
      this.getStatus(),
      this.getTrafficStats()
    ]
  }

  getBasicSettings () {
    return new Promise((resolve, reject) => {
      this.router.getBasicSettings(this.token, function (error, response) {
        if (error) {
          reject(error)
        }
        const g = new Gauge({
          name: 'huawei_wifi_enable',
          help: 'Is the WiFi AP enabled?',
          labelNames: ['ssid', 'channel']
        })

        g.set({ssid: response.WifiSsid[0], channel: response.WifiChannel[0]}, Metrics.asInt(response.WifiEnable))
        resolve()
      })
    })
  }

  getMonthStatistics () {
    return new Promise((resolve, reject) => {
      this.router.getMonthStatistics(this.token, function (error, response) {
        if (error) {
          reject(error)
        }

        const traffic = new Gauge({
          name: 'huawei_traffic_month',
          help: 'Number of bytes transmitted in the current billing month',
          labelNames: ['direction']
        })

        traffic.set({direction: 'download'}, Metrics.asInt(response.CurrentMonthDownload))
        traffic.set({direction: 'upload'}, Metrics.asInt(response.CurrentMonthUpload))

        resolve()
      })
    })
  }

  getSignal () {
    return new Promise((resolve, reject) => {
      this.router.getSignal(this.token, function (error, response) {
        if (error) {
          reject(error)
        }

        const rsrq = new Gauge({
          name: 'huawei_signal_rsrq',
          help: 'Reference Signal Received Quality (dB)'
        })

        const rsrp = new Gauge({
          name: 'huawei_signal_rsrp',
          help: 'Reference Signal Receive Power (dBm) is the average power of Resource Elements (RE) that carry cell specific Reference Signals (RS) over the entire bandwidth'
        })

        const rssi = new Gauge({
          name: 'huawei_signal_rssi',
          help: 'The carrier RSSI (Receive Strength Signal Indicator) measures the average total received power observed (dBm)'
        })

        const sinr = new Gauge({
          name: 'huawei_signal_sinr',
          help: 'Signal to Interference plus Noise Ratio is a quantity used to give theoretical upper bounds on channel capacity (dB)'
        })

        let matches = response.rssi[0].match(/(\d+)/)
        rssi.set(parseInt(parseInt(matches[1])))

        sinr.set(Metrics.asInt(response.sinr))
        sinr.set(Metrics.asInt(response.sinr))
        rsrp.set(Metrics.asInt(response.rsrp))
        rsrq.set(Metrics.asInt(response.rsrq))

        resolve()
      })
    })
  }

  getStatus () {
    return new Promise((resolve, reject) => {
      this.router.getStatus(this.token, function (error, response) {
        if (error) {
          reject(error)
        }

        const wifiUser = new Gauge({
          name: 'huawei_status_wifi_user',
          help: 'Number of connected WiFi users',
          labelNames: ['type']
        })
        wifiUser.set({type: 'current'}, Metrics.asInt(response.CurrentWifiUser))
        wifiUser.set({type: 'max'}, Metrics.asInt(response.TotalWifiUser))

        const voiceBusy = new Gauge({
          name: 'huawei_status_voice_busy',
          help: 'Is there an active voice connection'
        })
        voiceBusy.set(Metrics.asInt(response.voice_busy))

        const serviceStatus = new Gauge({
          name: 'huawei_status_service',
          help: 'Status of the Huawei API service (?)',
          labelNames: ['wan_ip']
        })
        serviceStatus.set({wan_ip: response.WanIPAddress[0]}, Metrics.asInt(response.ServiceStatus))

        resolve()
      })
    })
  }

  getTrafficStats () {
    return new Promise((resolve, reject) => {
      this.router.getTrafficStatistics(this.token, function (error, response) {
        if (error) {
          reject(error)
        }

        const currentTraffic = new Gauge({
          name: 'huawei_traffic_current',
          help: 'Number of bytes transmitted',
          labelNames: ['direction']
        })

        currentTraffic.set({direction: 'upload'}, Metrics.asInt(response.CurrentUpload))
        currentTraffic.set({direction: 'download'}, Metrics.asInt(response.CurrentDownload))

        const totalTraffic = new Gauge({
          name: 'huawei_traffic_total',
          help: 'Total number of bytes transmitted',
          labelNames: ['direction']
        })

        totalTraffic.set({direction: 'upload'}, Metrics.asInt(response.TotalUpload))
        totalTraffic.set({direction: 'download'}, Metrics.asInt(response.TotalDownload))

        resolve()
      })
    })
  }
}

module.exports = Metrics
