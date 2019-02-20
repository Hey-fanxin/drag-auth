
这里有 【jquery插件版本，JS原生版本】对应依赖是jQuery：2.x以上，jquery.ajax工具或插件。
在当前 demo 中后台地址是由第三方提供由于前台直接发送请求或有跨域问题请下载项目后再本地 Nginx 中配置 
----
    location /edusoho/ {
       proxy_pass   http://chenyufen1.edusoho.cn/;
    }
----