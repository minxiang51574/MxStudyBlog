/*
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-08-29 09:21:47
 * @LastEditTime: 2019-08-29 16:34:34
 * @LastEditors: Please set LastEditors
 */
module.exports = {
	head: [
		['link', {rel: 'icon', href: '/logo.png'}]
	],
	base: '/MxBlog/',
	locales: {
		'/': {
			title: 'MxBlog',
			description: '记录这一路走来'
		}
	},
	serviceWorker: true,
	themeConfig: {
		repo: 'docschina/vuepress',
		editLinks: true,
		docsDir: 'docs',
		locales: {
			'/': {
				selectText: '选择语言',
				editLinkText: '编辑此页',
				lastUpdated: '上次更新',
				nav: [
					{
                        text: '前端基础',
                        link: "/webBase/"
                    },
                    {
                        text:'webpack',
                        link:"/webpack/"
                    },
                    {
                        text:'vue',
                        link:'/vue/'
                    },
                    {
                        text: '项目',
                        link: '/items/'
                    },
				],
				sidebar: {
					'/webBase/': [
                        '',
                        'HTTP',
                        'HTML',
						'CSS',
                        'JS',
						'ES6',
						'数组操作',
                        'react',
                        'items',
                        'exam'
                    ],
                    '/webpack/':[],
                    '/vue/': [],
                    '/items/': [
                        '',
                        'vue-admin',
                        'react-jianshu',
                    ],
				}
			}
		}
	}
}
