---
title: "如何优雅地在Mac上使用Anaconda"
date: 2023-12-23
Description: ""
tags: [ "Mac", "Python"]
draft: false
comments: true
---

mac买了之后一直作为娱乐工具，主要看看片子、听听歌、修修图；最近有外出办公的需求，win本太重了，且续航不能满足需求，遂决定在mac上配置Anaconda环境。

### 1、下载Ananconda
清华镜像网站：https://mirrors.tuna.tsinghua.edu.cn/anaconda/archive/

### 2、安装
一直下一步，安装。

### 3、配置
#### channels
``` shell
# ~/.condarc
ssl_verify: false
channels:
  - https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/free/
  - https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud/conda-forge/
  - https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud/msys2/
show_channel_urls: true
```
#### init
``` shell
source ~/.bash_profile
vi .bash_profile
# anaconda init相关语句
# added by Anaconda3 5.3.1 installer
# >>> conda init >>>
# !! Contents within this block are managed by 'conda init' !!
__conda_setup="$(CONDA_REPORT_ERRORS=false '/Users/yuyang/anaconda3/bin/conda' shell.bash hook 2> /dev/null)"
if [ $? -eq 0 ]; then
    \eval "$__conda_setup"
else
    if [ -f "/Users/yuyang/anaconda3/etc/profile.d/conda.sh" ]; then
        . "/Users/yuyang/anaconda3/etc/profile.d/conda.sh"
        CONDA_CHANGEPS1=false conda activate base
    else
        \export PATH="/Users/yuyang/anaconda3/bin:$PATH"
    fi
fi
unset __conda_setup
# <<< conda init <<<

sudo vi .zshrc
# 将anaconda init相关语句粘贴到此处
source .zshrc
```
### 4、使用
``` shell
conda create --name test python==3.7.9
conda activate test
pip  --default-timeout=30 install -r requirements.txt
```
