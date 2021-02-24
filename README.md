# PostGIS-Dynamic-Vector-Tile

Node + PostGIS 动态矢量切片服务 | Node + PostGIS dynamic vector tile service

基于 Node + PostGIS 实现地图数据的动态矢量切片服务。

项目目录结构如下：

    |-- bin
        |-- www
    |-- model
        |-- pgConfig.js // 数据库配置文件
        |-- spatial.js // 矢量切片业务逻辑
    |-- public
        |-- images
        |-- javascripts
        |-- stylesheets
    |-- routes
        |-- index.js // 路由
    |-- views
        |-- error.pug
        |-- index.pug
        |-- layout.pug
    |-- app.js
    |-- package.json
    |-- README.md
    
    
[原文：Node + Express + PostGIS 动态矢量切片](https://www.jianshu.com/p/585d510b0028)