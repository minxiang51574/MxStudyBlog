/*
 * @Author: MX
 * @Date: 2020-11-23 15:18:53
 * @Description: 
 */
module.exports = {
	head: [
		['link', {rel: 'icon', href: '/logo.png'}]
	],
	base: '/blog/',
	locales: {
		'/': {
			title: 'blog',
			description: '不积硅步无以至千里'
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
                        text: '前端进阶',
                        link: "/webImprove/"
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
                        text: 'react',
                        link: '/react/'
                    },
                    {
                        text: 'node',
                        link: '/node/'
                    },
                    // {
                    //     text: '项目',
                    //     link: '/items/'
                    // },
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
                        // 'items',
                        // 'exam'
                    ],
                    '/webImprove/': [
                        '',
                        '缓存',
                        'JS执行机制',
                        '防抖节流'
                    ],
                    '/webpack/':[
                        ''
                    ],
                    '/vue/': [
                        '',
                        'vue源码分析'
                    ],
                    '/react/': [],
                    '/node/': [],
                    // '/items/': [
                    //     '',
                    //     'vue-admin',
                    //     'react-jianshu',
                    // ],
				}
			}
		}
	}
}
