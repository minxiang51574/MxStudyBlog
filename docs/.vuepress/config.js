module.exports = {
	head: [
		['link', {rel: 'icon', href: '/logo2.png'}]
	],
	base: '/mxBlog/',
	locales: {
		'/': {
			title: 'mxBlog',
			description: '不积硅步无以至千里'
		}
	},
	serviceWorker: true,
	themeConfig: {
		repo: 'minxiang51574',
		editLinks: true,
		docsDir: 'docs',
		locales: {
			'/': {
				selectText: '选择语言',
				editLinkText: '编辑此页',
				lastUpdated: '上次更新',
				nav: [
                    {
                        text: '吐血整理八股',
                        link: "/allStart/"
                    },
					{
                        text: '基础',
                        link: "/base/"
                    },
                    {
                        text: '进阶',
                        link: "/improve/"
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
                    },
                    {
                        text:'算法',
                        link:'/arithmetic/'
                    },
                    // {
                    //     text: '项目',
                    //     link: '/items/'
                    // },
				],
				sidebar: {
                    '/allStart/':[
                        '',
                        'CSS',
                        'JavaScript',
                        '计算机网络',
                        '浏览器原理',
                        '手写代码',
                        '性能优化',
                        '前端工程化',
                        '代码输出',
                        'Vue',
                        'Vue优化',
                        'LeetCode'

                    ],
					'/base/': [
                        // '',
                        'HTTP',
                        'HTML',
						'CSS',
                        'JS',
                        'ES6',
                        '数组',
                        // 'exam'
                    ],
                    '/improve/': [
                        '缓存',
                        'JS执行机制',
                        'Promise',
                        'webpack'
                    ],
                    // '/webpack/':[
                    //     ''
                    // ],
                    '/write/':[ 
                        ''
                    ],
                    '/vue/': [
                        '',
                        'Vuex',
                        'Vue3',
                        'Vite'
                    ],
                    '/vueBase/': [
                        '',
                        'Vue源码分析'
                    ],
                    '/react/': [
                        '',
                    ],
                    '/reactBase/': [
                        ''
                    ],
                    '/node/': [],
                    '/test/': [],
                    '/arithmetic/':[]
				}
			}
		}
	}
}
