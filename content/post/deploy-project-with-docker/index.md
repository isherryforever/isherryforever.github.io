---
title: "如何优雅地容器化部署前后端分离项目"
date: 2024-01-28
Description: ""
tags: ["Docker"]
draft: false
comments: true
---
## 问题提出
目前开发了一个demo系统，前端为**demo-admin**，后端为**demo-service**，数据库为**demo-sql**。我希望用户可以使用docker-compose将demo系统一键部署，不需要考虑系统**宿主机IP地址变化**的问题。 

若要实现这一操作，需要解决以下两个问题：  
（1）后端代码如何动态配置数据库连接地址？  
（2）前端代码如何动态配置后端接口地址？  
下文围绕这两个问题展开讨论。

## 解决思路
### 1. 后端代码动态配置数据库连接地址
以我目前系统后端代码demo-service为例，使用Python语言开发，框架为Flask，连接数据库使用默认配置如下：
``` Python
# stage_config.py
HOSTNAME = '192.168.1.XXX'
PORT     = '3306'
DATABASE = 'Demo'
USERNAME = 'root'
PASSWORD = 'XXXXXX'
DB_URI = 'mysql+pymysql://{}:{}@{}:{}/{}?charset=utf8'.format(USERNAME,PASSWORD,HOSTNAME,PORT,DATABASE)
SQLALCHEMY_DATABASE_URI = DB_URI
```
若需动态配置数据库IP地址，需改动如下：
其中，‘demo-sql’为数据库启动后的容器名称。
``` Python
# stage_config.py
# HOSTNAME = '192.168.1.XXX'
HOSTNAME = demo-sql
PORT     = '3306'
DATABASE = 'Demo'
USERNAME = 'root'
PASSWORD = 'XXXXXX'
DB_URI = 'mysql+pymysql://{}:{}@{}:{}/{}?charset=utf8'.format(USERNAME,PASSWORD,HOSTNAME,PORT,DATABASE)
SQLALCHEMY_DATABASE_URI = DB_URI
```
### 2. 前端代码如何动态配置后端接口地址？
以我目前系统前端代码demo-admin为例，使用vue-admin-template为基础模板，前端对后端接口的默认配置如下：
``` javascript
# .env.production
# just a flag
ENV = 'production'

# base api
VUE_APP_BASE_API = 'http://192.168.1.xxx:8889/api/frontend/v1'
```
修改后的配置如下：
``` javascript
# .env.production
# just a flag
ENV = 'production'

# base api
VUE_APP_BASE_API = '/api/frontend/v1'
```
同时，使用nginx做反向代理，当baseApi不填写IP地址时，会转发到前端程序。此时，只需nginx对‘/api/frontend/v1’开头的请求做转发，转发到‘demo-service’即可，‘demo-service’为后端容器镜像名称。  
nginx.conf配置如下：
``` shell
user  nginx;
worker_processes  auto;

error_log  /var/log/nginx/error.log notice;
pid        /var/run/nginx.pid;

events {
    worker_connections  1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile        on;
    keepalive_timeout  65;

    include /etc/nginx/conf.d/*.conf;

    server {
        listen 9528;
        server_name localhost;

        location / {
            root /usr/share/nginx/html/dist;
            index index.html;
            try_files $uri $uri/ /index.html;
        }

        location /api/frontend/v1/ {
                  add_header Access-Control-Allow-Origin *;
                  add_header Access-Control-Allow-Methods 'GET,POST,OPTIONS,PUT,DELETE';
                  add_header Access-Control-Allow-Headers 'Token,DNT,X-Mx-ReqToken,keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization';
                  proxy_pass  http://demo-service:8889/api/frontend/v1/;
        }
    }
}
```
### 3. 完整的docker-compose.yml文件
``` shell
version: '3.7'

service:
  demo-sql；
    image: mysql:v8.0.21
    container_name: demo-sql
    environment:
        MYSQL_ROOT_PASSWORD: 
    ports:
      - "3306:3306"
    volumes:
      - ./mysql-data:/var/lib/mysql
      - ./demo.sql:/docker-entrypoint-initdb.d/demo.sql

  demo-service:
    image: demo-service:v1
    container_name: demo-service
    ports:
      - "8889:8889"
    volumes:
      - ./stage_config.py:/code/config/stage_config.py

  demo-admin:
    image: demo-admin:v1
    container_name: demo-admin
    ports:
      - "9528:9528"
    depends_on:
      - demo-service
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf

```
