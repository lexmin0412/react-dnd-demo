import React, { useState, useEffect, useMemo } from 'react'
import { getCurrentCursorPositionInDomElement, TOP, CENTER, BOTTOM } from '~/utils/dnd'

export interface TreeData {
	/**
	 * 唯一标识
	 */
	id: number
	/**
	 * 展示名称
	 */
	title: string
	/**
	 * 受控字段 包含下面的三个
	 */
	controlledFileds?: {

	}
	/**
	 * 是否展开
	 */
	opened?: boolean
	/**
	 * 是否高亮（文字高亮 样式展开等）
	 */
	highlighted?: boolean
	/**
	 * 当前聚焦 背景/文字颜色
	 */
	focused?: boolean
	// /**
	//  * 是否拖放效果的临时展示元素
	//  */
	// isTemp?: boolean
	/**
	 * 子元素
	 */
	children: Array<any>

}

interface IProps {
	data: TreeData[]
	onUpdateData: (data: TreeData[]) => void
	isOpen: boolean  // 是否展开
	/**
	 * item渲染规则
	 */
	renderItem: (data: {
		item: TreeData
		placeholder: {
			text: string
			disabled: boolean
		}
	}) => any
	/**
	 * 禁用拖拽的元素列表?
	 */
	// disabledDragList: any[]
}

/**
 * 递归寻找元素
 * @param findData
 * @param findId
 * @param idMap
 * @param writeFieds
 * @returns
 */
const dfs = (findData: any[], findId: string | number, idMap?: string[], writeFieds?: any) => {
	console.log('enter dfs', findData, findId, idMap, writeFieds);

	let foundItem: any = undefined
	if ( !idMap ) {
		idMap = []
	}
	findData.forEach((item: any, index: number) => {
		if (item.id.toString() === findId.toString()) {
			findData[index] = {...item, ...writeFieds}
			idMap.push(item.id)
			foundItem = {
				parent: findData,
				data: item,
				index,
				idMap
			}
			idMap = []
		} else if (item.children.length) {
			idMap.push(item.id)
			const childrenItem = dfs(item.children, findId, idMap, writeFieds)
			// console.log('childrenItem', childrenItem, item.id);
			if (childrenItem) {
				foundItem = childrenItem
				idMap = []
			} else {
				idMap = []
			}
		} else {
			idMap = []
		}
	})
	return foundItem
}

export default function DndComp(props: IProps) {

	const { data, onUpdateData, isOpen, renderItem } = props

	const [currentDragId, setCurrentDragId] = useState(0)
	const currentDragItem = useMemo(()=>{
		return dfs(data, currentDragId)?.data
	}, [currentDragId])

	const [currentOverId, setCurrentOverId] = useState(0)
	const [currentFocusId, setCurrentFocusId] = useState(data[0].id) // 当前聚焦的节点，需要展开
	const [ currentHighlightId, setCurrentHighlightId ] = useState(0)
	// const [ openedKeys, setOpenedKeys ] = useState([])

	const handleItemClick = (event: any, item: any, index: number) => {
		event.stopPropagation()

		// 找到元素，设置opened为true
		const toChangeData = [...data]
		const current = dfs(toChangeData, item.id, undefined)
		console.log('current', current);

		if ( current ) {
			const opened = current.data.opened
			dfs(toChangeData, item.id, undefined, {opened: !opened})
		}
		console.log('toChangeData', toChangeData);

		onUpdateData([...toChangeData])
		console.log('current', current);

		if (item.id !== currentFocusId) {
			setCurrentFocusId(item.id)
		}
	}

	/**
	 * 开始拖拽
	 * @param event 事件对象
	 * @param item 拖拽数据
	 * @param index 拖拽数据在所在层级的索引 预留
	 */
	const onDragStart = (event: any, item: any, index: number) => {
		// console.warn('onDragStart', event);
		// console.log('item.id', item.id);
		event.stopPropagation()  // 防止冒泡触发父元素事件
		event.dataTransfer?.setData('id', item.id)
		setCurrentDragId(item.id)
	}

	const canDrop = useMemo(()=>{
		const findOverItem = dfs(data, currentOverId)
		if ( !findOverItem ) {
			return false
		}
		// 判断当前组件是否能拖拽到当前区域
		if ( currentDragItem?.dropIn?.exclude?.includes[findOverItem?.parent?.area] ) {
			return true
		}
		return false
	}, [currentDragId, currentOverId])

	// 拖拽移动到元素上方事件
	const onDragOver = (event: any, item: any, index: number) => {
		event.stopPropagation()
		console.log('onDragOver', 'item.id:', item.id, 'currentOverId', currentOverId);

		// 过滤自己
		if ( currentDragId === item.id ) {
			return
		}

		if (item.id !== currentOverId) {
			setCurrentOverId(item.id)

			// 判断当前组件是否能放置到当前区域
			const toChangeData = [...data]
			const current = dfs(toChangeData, item.id, undefined)
			if (current) {
				const opened = current.data.opened
				dfs(toChangeData, item.id, undefined, {opened: !opened})
			}
			onUpdateData([...toChangeData])
		}

		event.preventDefault()
	}

	/**
	 * 拖拽离开某个元素
	 * @param event
	 * @param item
	 * @param index
	 */
	const onDragLeave = (event: any, item: any, index: number) => {
		// console.log('onDragLeave', event);
	}

	/**
	 * 拖拽释放
	 * @param event 释放时所在的DOM事件对象
	 * @param item 释放时所在的数据
	 * @param index 释放时所在的数据在所在层级的索引 预留
	 * @returns
	 */
	const onDrop = (event: any, item: any, index: number) => {
		event.stopPropagation()
		event.preventDefault()
		setCurrentOverId(0)

		// 如果不能拖拽到当前元素则不做任何操作
		if ( !canDrop ) {
			return
		}

		// 过滤自己拖到自己的情况
		if (currentDragId === item.id ) {
			return
		}

		const toChangeData = [...data]
		const sourceItem = dfs(toChangeData, currentDragId)
		const targetItem = dfs(toChangeData, item.id)

		if (sourceItem) {
			// 移除原位置

			sourceItem.parent.splice(sourceItem.index, 1)

			// 区分位置进行不同的插入操作
			const cursorPosition = getCurrentCursorPositionInDomElement(event)

			// 在新位置插入
			if (cursorPosition === CENTER) {
				targetItem.data.children.unshift(sourceItem.data)
			} else if ( cursorPosition === TOP ) {
				targetItem.parent.splice(targetItem.index, 0, sourceItem.data)
			} else if ( cursorPosition === BOTTOM ) {
				targetItem.parent.splice(targetItem.index +1, 0, sourceItem.data)
			}

			setCurrentFocusId(targetItem.data.id)
		}

		onUpdateData(toChangeData)
	}

	const RenderChildren = (props: any) => {
		const {item, index} = props
		return <div className={`item ${currentFocusId === item.id ? 'item-focused' : ''} ${item.opened ? 'item-opened' : ''} ${currentOverId === item.id ? 'item-over' : ''}`}
			key={item.id}
			onDragStart={(event) => onDragStart(event, item, index)}
			onDragOver={(event) => onDragOver(event, item, index)}
			onDragLeave={(event) => onDragLeave(event, item, index)}
			onDrop={(event) => onDrop(event, item, index)}
			draggable
			onClick={(event) => handleItemClick(event, item, index)}
			style={{
				height: isOpen ? 'auto' : '0',
				overflow: 'hidden'
			}}
		>
			{renderItem({
				item,
				placeholder: {
					text: currentOverId === item.id ? item.children.length ? `${currentDragItem?.title}组件不能放置在${item.title}区域` : `${currentDragItem?.title}` : '',
					disabled: !canDrop
				}
			})}
			{/* 渲染children */}
			{item.opened && item.children.map((ele, index) => RenderChildren({item: ele, index}))}
		</div>
	}

	return (
		<div className="list">
			{data.map((item, index) => RenderChildren({item, index}))}
		</div>
	)
}
