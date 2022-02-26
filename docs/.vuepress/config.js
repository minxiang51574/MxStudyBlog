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
                        text: '基础',
                        link: "/base/"
                    },
                    {
                        text: '进阶',
                        link: "/webImprove/"
                    },
                    {
                        text:'webpack',
                        link:"/webpack/"
                    },
                    {
                        text:'手写',
                        link:'/write/',
                    },
                    {
                        text:'Vue',
                        link:'/vue/'
                    },
                    {
                        text:'Vue基础',
                        link:'/vueBase/'
                    },
                    {
                        text:'React',
                        link:'/react/'
                    },
                    {
                        text: 'React基础',
                        link: '/reactBase/'
                    },
                    {
                        text: 'Node',
                        link: '/node/'
                    },
                    {
                        text: '大厂真题',
                        link: '/test/'
                    },
                    {
                        text: 'TypeScript',
                        link: '/typeScript/'
                    }
                    // {
                    //     text: '项目',
                    //     link: '/items/'
                    // },
				],
				sidebar: {
					'/base/': [
                        // '',
                        'HTTP',
                        'HTML',
						'CSS',
                        'JS',
                        'ES6',
                        '数组',
                        'exam'
                    ],
                    '/webImprove/': [
                        // '',
                        '缓存',
                        'JS执行机制',
                        '防抖节流'
                    ],
                    '/webpack/':[
                        ''
                    ],
                    '/write/':[ 
                        ''
                    ],
                    '/vue/': [
                        '',
                        'vue3'
                    ],
                    '/vueBase/': [
                        '',
                        'vue源码分析'
                    ],
                    '/react/': [
                        '',
                    ],
                    '/reactBase/': [
                        ''
                    ],
                    '/node/': [],
                    '/test/': [],
				}
			}
		}
	}
}
