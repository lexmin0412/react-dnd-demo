import Dashboard from "~/pages/Dashboard/Dashboard"
import RuleManage from "~/pages/RuleManage/RuleManage"
import Dnd from '~/pages/Dnd/index'

const routes = [
	{
		title: '卡片',
		path: '/',
		component: Dashboard
	},
	{
		title: '卡片',
		path: '/dashboard',
		component: Dashboard
	},
	{
		title: '表格',
		path: '/ruleManage',
		component: RuleManage
	},
	{
		title: '拖拽',
		path: '/dnd',
		component: Dnd
	},
]

export default routes
