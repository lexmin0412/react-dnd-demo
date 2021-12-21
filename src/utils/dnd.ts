export const TOP = 'top'
export const CENTER = 'center'
export const BOTTOM = 'bottom'

// 获取当前鼠标在元素中的位置 top-顶部 center-中间 bottom-底部
export function getCurrentCursorPositionInDomElement(event: any) {
	const pageY = event.pageY - event.target.offsetTop;
	const ypercent = pageY / event.target.clientHeight * 100; // 转百分比
	if (ypercent < 20) {
		return TOP
	}
	if (ypercent < 80) {
		return CENTER
	}
	return BOTTOM
}
