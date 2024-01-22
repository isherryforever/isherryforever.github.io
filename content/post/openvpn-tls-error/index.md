---
title: "OpenVPN TLS 证书过期问题"
date: 2023-07-09
Description: ""
tags: [ "VPN"]
draft: false
comments: true
---

报错如下
```
TLS Error: TLS key negotiation failed to occur within 60 seconds (check your network connectivity)
```
多次排查后确认是TLS证书过期，重新生成pki目录下所有证书即可；
命令如下：

```shell
# 查看Docker镜像
root@controller:/etc/ovpn-data# docker ps -a
CONTAINER ID        IMAGE                      COMMAND             CREATED             STATUS              PORTS                    NAMES
a54609fef4f0        kylemanna/openvpn:latest   "ovpn_run"          27 minutes ago      Up 27 minutes       0.0.0.0:1194->1194/udp   ovpn-
# 进入Docker
root@controller:/etc/ovpn-data# docker exec -it ovpn- /bin/bash
bash-5.0#
# 重新配置证书
# your_cloud_server_ipv4替换为自己云服务器的公网IPV4
bash-5.0# cd /etc/openvpn
bash-5.0# rm -rf pki
bash-5.0# easyrsa init-pki
bash-5.0# easyrsa build-ca
bash-5.0# easyrsa gen-req your_cloud_server_ipv4 nopass
bash-5.0# easyrsa sign server your_cloud_server_ipv4
bash-5.0# easyrsa gen-dh
bash-5.0# easyrsa gen-crl
bash-5.0# openvpn --genkey --secret pki/ta.key
# 参照openvpn.sh修改生成证书的路径
bash-5.0# vi /etc/openvpn/openvpn.sh
*************************
key /etc/openvpn/pki/private/your_cloud_server_ipv4.key
ca /etc/openvpn/pki/ca.crt
cert /etc/openvpn/pki/issued/your_cloud_server_ipv4.crt
dh /etc/openvpn/pki/dh.pem
tls-auth /etc/openvpn/pki/ta.key
**************************
# 退出容器，重启
bash-5.0# exit
root@controller:/etc/ovpn-data# service docker restart
```