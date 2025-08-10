# 使用一个轻量的 web server 来提供服务 - 使用最新版本
FROM nginx:alpine

# 复制本地构建的 dist 目录
COPY dist /usr/share/nginx/html

# 复制 Nginx 配置文件
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]