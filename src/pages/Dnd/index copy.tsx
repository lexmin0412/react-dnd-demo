import React, { useState, useEffect } from 'react'
import { getCurrentCursorPositionInDomElement, TOP, CENTER, BOTTOM } from '~/utils/dnd'
import DndComp, { TreeData } from '~/components/DndComp_clean'
import './index.less'

const defaultData: TreeData[] = [
	{
		name: 'item1', id: 1,
		showChildren: true, children: [
			{
				name: 'item1-1',
				id: 1.1,
				children: [
					{
						name: 'item1-1-1',
						id: '1.1.1',
						children: []
					},
					{
						name: 'item1-1-2',
						id: '1.1.2',
						children: []
					},
				]
			}
		]
	},
	{name: 'item2', id: 2, children: []},
	{
		name: 'item3', id: 3, children: [
			{
				name: 'item3-1',
				id: 3.1,
				children: []
			}
		], showChildren: true
	},
	{name: 'item4', id: 4, children: []},
	{name: 'item5', id: 5, children: []},
]

export default function Index() {

	// const [ currentDragId, setCurrentDragId ] = useState(0)
	// const [ currentOverId, setCurrentOverId ] = useState(0)
	// const [ currentFocusId, setCurrentFocusId ] = useState(1) // 当前聚焦的节点，需要展开
	const [data, setData] = useState<TreeData[]>(defaultData)

	// const [ data, setData ] = useState<{
	// 	name: string
	// 	id: number
	// 	children: Array<any>
	// 	showChildren?: boolean
	// }[]>([
	// 	{
	// 		name: 'item1', id: 1,
	// 		showChildren: true, children: [
	// 		{
	// 			name: 'item1-1',
	// 			id: 1.1,
	// 			children: []
	// 		}
	// 	] },
	// 	{name: 'item2', id: 2, children: [] },
	// 	{
	// 		name: 'item3', id: 3, children: [
	// 			{
	// 				name: 'item3-1',
	// 				id: 3.1,
	// 				children: []
	// 			}
	// 		], showChildren: true },
	// 	{name: 'item4', id: 4, children: [] },
	// 	{name: 'item5', id: 5, children: [] },
	// ])

	// // 拖拽开始事件
	// const onDragStart = (event: any, item: any, index: number) => {
	// 	console.warn('onDragStart', event);
	// 	console.log('item.id', item.id);
	// 	event.stopPropagation()  // 防止冒泡触发父元素事件
	// 	event.dataTransfer?.setData('id', event.target?.id)
	// 	setCurrentDragId(item.id)
	// }

	// // 拖拽移动到元素上方事件
	// const onDragOver = (event: any, item: any, index: number) => {
	// 	event.stopPropagation()
	// 	if ( item.id !== currentOverId ) {
	// 		console.log('onDragOver', event);
	// 		setCurrentOverId(item.id)
	// 	}
	// 	event.preventDefault()
	// }

	// // 拖拽离开元素事件
	// const onDragLeave = (event: any, item: any, index: number) => {
	// 	console.log('onDragLeave', event);
	// }

	// // 拖放事件
	// const onDrop = (event: any, item: any, index: number) => {
	// 	event.stopPropagation()
	// 	event.preventDefault()
	// 	console.log('onDrop', event)

	// 	console.log('currentDragId', currentDragId)
	// 	console.log('item', item);

	// 	const toChangeData = [...data]

	// 	const dgFind = (findData: any[], findId: string | number) => {
	// 		let foundItem: any = undefined
	// 		findData.forEach((item: any, index: number)=>{
	// 			console.log('对比', 'item.id',item.id, 'findId',findId);

	// 			if ( item.id === findId ) {
	// 				console.log('找到了，返回', item);

	// 				foundItem = {
	// 					parent: findData,
	// 					data: item,
	// 					index
	// 				}
	// 			}
	// 			if (item.children) {
	// 				const childrenItem = dgFind(item.children, findId)
	// 				console.log('childrenItem', childrenItem);
	// 				if (childrenItem) {
	// 					foundItem = {
	// 						parent: childrenItem.parent,
	// 						data: childrenItem.data,
	// 						index: childrenItem.index
	// 					}
	// 				}
	// 			}
	// 		})
	// 		return foundItem
	// 	}
	// 	const sourceItem = dgFind(toChangeData, currentDragId)
	// 	const targetItem = dgFind(toChangeData, item.id)

	// 	console.log('sourceItem', sourceItem);
	// 	console.log('targetItem', targetItem);
	// 	if ( sourceItem ) {
	// 		// 移除原位置
	// 		console.log('sourceItem.parent', sourceItem.parent);

	// 		sourceItem.parent.splice(sourceItem.index, 1)
	// 		// 在新位置插入
	// 		targetItem.data.children.unshift(sourceItem.data)
	// 		setCurrentFocusId(targetItem.data.id)
	// 	}
	// 	console.log('toChangeData', toChangeData);

	// 	setData([...toChangeData])  // 深拷贝才能触发依赖data的重新渲染

	// }

	return (
		<div>
			<DndComp
				data={data}
				onUpdateData={(data: TreeData[])=>setData(data)}
				isOpen={true}
				renderItem={(item, placeholder)=>{
					return (
						<div className={`item-place-holder ${placeholder.disabled ? 'placeholder-disabled':''}`}
							data-place-text={placeholder.text}
						>
							<span className="item-icon" />
							{item.name}
						</div>
					)
				}}
			/>
		</div>
	)
}
