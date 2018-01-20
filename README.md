# huawei-4g-exporter

A [Prometheus](https://prometheus.io) exporter for Huawei 4G routers (B315).

*This is a work-in-progress and not complete. Code interface and reported metric naming and structure can change at any time.
Pull requests with helpful contributions are very welcome.*

## Configuration

The following environment variables can be set.

- `HUAWEI_GW_IP` - **required** *(192.168.1.2)*
- `HUAWEI_GW_USERNAME` - **required** *(admin)*
- `HUAWEI_GW_PASSWORD` - **required** *(admin)*
- `SERVER_PORT` - *(default `8080`)*
- `SERVER_HOST` - *(default `0.0.0.0`)*

## Running

```bash
# Using Docker Compose
HUAWEI_GW_PASSWORD='admin' HUAWEI_GW_USERNAME='admin' HUAWEI_GW_IP='192.168.1.2' docker-compose up

# Natively
npm install
HUAWEI_GW_PASSWORD='admin' HUAWEI_GW_USERNAME='admin' HUAWEI_GW_IP='192.168.1.2' node src/export.js
```

Metrics can be read from `http://SERVER_HOST:SERVER_PORT/metrics` endpoint.

## Reported Metrics

Metrics are retrieved from the router using [dialog-router-api](https://github.com/ishan-marikar/dialog-router-api)
package. Not all available metrics are implemented.

## License

MIT license
