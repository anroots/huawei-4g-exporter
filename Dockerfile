FROM node:9-alpine

LABEL maintainer="Ando Roots <ando@sqroot.eu>"
WORKDIR /opt/huawei-4g-exporter
EXPOSE 8080

COPY . .

RUN npm install

CMD ["node", "src/export.js"]