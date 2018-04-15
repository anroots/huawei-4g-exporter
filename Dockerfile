FROM node:9-alpine

LABEL maintainer="Ando Roots <ando@sqroot.eu>"

WORKDIR /opt/huawei-4g-exporter
EXPOSE 8080
ENV HUAWEI_GW_IP="" HUAWEI_GW_USERNAME=admin HUAWEI_GW_PASSWORD="" SERVER_PORT=8080 SERVER_HOST=0.0.0.0

COPY . .

RUN npm install

USER 1000
CMD ["node", "src/export.js"]