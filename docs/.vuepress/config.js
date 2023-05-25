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
                        text: '八股文合集',
                        link: "/bagu/"
                    },
                    {
                        text: '前端工程化',
                        link: "/engineering/"
                    },
                    {
                        text: '源码系列',
                        link: "/sourceCode/"
                    },
					{
                        text: '前端基础',
                        link: "/base/"
                    },
                    // blog
                    {
                        text:'Vue',
                        link:'/vue/'
                    },
                    // blog
                    {
                        text: 'Node',
                        link: '/node/'
                    },
                    // blog
                    // {
                    //     text: '大厂真题',
                    //     link: '/test/'
                    // },
                    {
                        text:'数据结构与算法',
                        link:'/data/'
                    },
                    {
                        text:'开源&文章',
                        link:'/openSource/'
                    },
				],
				sidebar: {
                    '/bagu/':[
                        '',
                        'CSS',
                        'JavaScript',
                        '计算机网络',
                        '浏览器原理',
                        '手写代码',
                        '性能优化',
                        '代码输出',
                        'Vue',
                        'Vue优化',
                        'React',
                        'TypeScript'
                    ],
                    '/engineering/':[
                        '',
                        'Webpack',
                        'Vite',
                        '设计模式',
                        'Git'
                    ],
                    '/sourceCode/':[
                        '',
                        'Vue3',
                        'Vuex',
                    ],
					'/base/': [
                        'HTTP',
                        'HTML',
						'CSS',
                        'JS',
                        '数组',
                        '缓存',
                        'JS执行机制',
                        'Promise',
                    ],
                    '/vue/': [
                        '',
                        'Vue2',
                        'Vue3',
                    ],
                    '/vueBase/': [
                        '',
                    ],
                    '/node/': [],
                    '/test/': [],
                    '/data/':[
                        '',
                        'LeetCode'
                    ],
                    '/openSource/':[
                        '',
                        'mx-uniapp-template-v2',
                        'mxAdminVue3',
                        'qiankunExample'
                    ]
				}
			}
		}
	}
}
