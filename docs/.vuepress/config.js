"use strict";

module.exports = {
  title: 'Artskin VuePress',
  description: 'Document library',
  head: [
    ['link', { rel: 'icon', href: `/favicon.ico` }],
  ],
  serviceWorker: true,
  themeConfig: {
    nav: [
      { text: '主页', link: '/' },
      { text: '前端规范', link: '/frontEnd/' },
      { text: '开发环境', link: '/development/' },
      { text: '学习文档', link: '/notes/' },
      { text: '游魂博客', link: 'https://www.iyouhun.com' },
      // 下拉列表的配置
      {
        text: 'Languages',
        items: [
          { text: 'Chinese', link: '/language/chinese' },
          { text: 'English', link: '/language/English' }
        ]
      }
    ],
    sidebar: {
      '/note': [
        {
          title:'前端',
          collapsable: true,
          children:[
            '/notes/frontEnd/VueJS组件编码规范',
            '/notes/frontEnd/vue-cli脚手架快速搭建项目',
            '/notes/frontEnd/深入理解vue中的slot与slot-scope',
            '/notes/frontEnd/webpack入门',
            '/notes/frontEnd/PWA介绍及快速上手搭建一个PWA应用',
          ]
        },
        {
          title:'后端',
          collapsable: true,
          children:[
            'notes/backEnd/nginx入门',
            'notes/backEnd/CentOS如何挂载磁盘',
          ]
        },
      ]
    }
  }
}