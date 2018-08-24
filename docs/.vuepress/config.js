"use strict";

module.exports = {
  title: '谷阿沐',
  description: '阿沐的学习资料整理，Document library',
  head: [
    ['link', { rel: 'icon', href: `../favicon.ico` }],
  ],
  serviceWorker: true,
  themeConfig: {
    nav: [
      { text: '主页', link: '/' },
      { text: '前端规范', link: '/guide/' },
      { text: '开发环境', link: '/development/' },
      { text: '学习文档', link: '/notes/' },
      // 下拉列表的配置
      {
        text: 'Languages',
        items: [
          { text: 'Zh-cn', link: '/language/chinese' },
          { text: 'En', link: '/language/English' }
        ]
      }
    ],
    sidebar: 
      [
        {
          title:'简介',
          collapsable: false,
          children:[
            '/'
          ]
        },
        {
          title:'安装',
          collapsable: true,
          children:[
            '/guide/',
          ]
        },
        {
          title:'关于事件',
          collapsable: true,
          children:[
            'notes/event/'
          ]
        },
      ]
    
  }
}