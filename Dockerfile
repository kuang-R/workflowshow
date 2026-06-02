FROM node:24-alpine

RUN apk add --no-cache nginx

WORKDIR /app

# 安装依赖（不常变）
COPY package.json package-lock.json ./
RUN npm ci

# 复制应用代码（主题、配置）
COPY docs/ ./docs/
# 复制内容文件
COPY content/ ./content/

COPY entrypoint.sh /
RUN chmod +x /entrypoint.sh

COPY nginx.conf /etc/nginx/http.d/default.conf

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
