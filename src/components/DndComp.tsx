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
	name: string
	/**
	 * 受控字段 包含下面的三个
	 */
	controlledFileds: {

	}
	/**
	 * 是否展开
	 */
	opened: boolean
	/**
	 * 是否高亮（文字高亮 样式展开等）
	 */
	highlighted: boolean
	/**
	 * 当前聚焦 背景/文字颜色
	 */
	focused: boolean
	/**
	 * 是否拖放效果的临时展示元素
	 */
	isTemp: boolean
	/**
	 * 子元素
	 */
	children: Array<any>

}

interface IProps {
	data: TreeData[]
	onUpdateData: (data: TreeData[]) => void
	isOpen: boolean  // 是否展开
	parentId?: number  // 当前列表的父节点id 如果为最顶层则传空
	/**
	 * 禁用拖拽的元素列表?
	 */
	// disabledDragList: any[]
}

let interval = null

const dgFind = (findData: any[], findId: string | number, idMap?: string[], writeFieds?: any) => {
	console.log('enter dgfind', findData, findId, idMap, writeFieds);

	let foundItem: any = undefined
	if ( !idMap ) {
		idMap = []
	}
	findData.forEach((item: any, index: number) => {
		// console.log('对比', 'item.id', item.id, 'findId', findId);
		// console.log('idMap in forEach', idMap);


		if (item.id.toString() === findId.toString()) {

			findData[index] = {...item, ...writeFieds}
			console.log('修改后的数据', item);
			console.log('findData', findData);



			idMap.push(item.id)
			// console.log('找到了，返回', item);

			foundItem = {
				parent: findData,
				data: item,
				index,
				idMap
			}
			idMap = []
		} else if (item.children.length) {
			idMap.push(item.id)
			const childrenItem = dgFind(item.children, findId, idMap, writeFieds)
			// console.log('childrenItem', childrenItem, item.id);
			if (childrenItem) {
				foundItem = childrenItem
				idMap = []
			} else {
				// console.log('当前节点为根节点，重置', item.id);
				idMap = []
			}
		} else {
			// console.log('当前节点为根节点，重置', item.id);

			idMap = []
		}
	})
	return foundItem
}

export default function DndComp(props: IProps) {

	const { data, onUpdateData, isOpen, parentId } = props

	// const [ data, setData ] = useState(propsData)
	// useEffect(()=>{
	// 	setData(propsData)
	// }, [propsData])

	// console.log('data in DndComp', propsData);


	const [currentDragId, setCurrentDragId] = useState(0)
	const currentDragItem = useMemo(()=>{
		return dgFind(data, currentDragId)?.data
	}, [currentDragId])
	// const currentDragItem = data.find(item=>item.id === currentDragId)
	console.log('currentDragItem', currentDragItem);

	const [currentOverId, setCurrentOverId] = useState(0)
	const [currentFocusId, setCurrentFocusId] = useState(data[0].id) // 当前聚焦的节点，需要展开
	const [ currentHighlightId, setCurrentHighlightId ] = useState(0)
	// const [ openedKeys, setOpenedKeys ] = useState([])

	const handleItemClick = (event: any, item: any, index: number) => {
		event.stopPropagation()
		// console.log('handleItemClick', 'item.id', item.id, 'currentFocusId', currentFocusId);

		// 找到元素，设置opened为true
		const toChangeData = [...data]
		const current = dgFind(toChangeData, item.id, undefined)
		console.log('current', current);

		if ( current ) {
			const opened = current.data.opened
			dgFind(toChangeData, item.id, undefined, {opened: !opened})
		}
		console.log('toChangeData', toChangeData);

		onUpdateData([...toChangeData])
		console.log('current', current);

		// setCurrentFocusId(0)
		if (item.id !== currentFocusId) {
			setCurrentFocusId(item.id)
		}
	}

	// console.log('into render: currentDragId:', currentDragId);


	// 拖拽开始事件
	const onDragStart = (event: any, item: any, index: number) => {
		// console.warn('onDragStart', event);
		// console.log('item.id', item.id);
		event.stopPropagation()  // 防止冒泡触发父元素事件
		event.dataTransfer?.setData('id', item.id)
		setCurrentDragId(item.id)
	}

	const canDrop = useMemo(()=>{
		const findOverItem = dgFind(data, currentOverId)
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
			// 判断当前组件是否能放置到当前区域
			// if (  ) {

			// }
			setCurrentOverId(item.id)

			const toChangeData = [...data]
			const current = dgFind(toChangeData, item.id, undefined)
			console.log('current', current);

			if (current) {
				const opened = current.data.opened
				dgFind(toChangeData, item.id, undefined, {opened: !opened})
			}
			console.log('toChangeData', toChangeData);

			onUpdateData([...toChangeData])

			// const current = dgFind(data, item.id)
			// if ( current && current.parent ) {

			// 	const parent = dgFind(data, current.parent.id)
			// 	console.log('当前高亮', parent);
			// 	setCurrentHighlightId(parent.id)
			// }


			// clearTimeout(interval)

			// interval = setTimeout(() => {
			// 	const sourceItem = dgFind(data, currentDragId)
			// 	const targetItem = dgFind(data, item.id)
			// 	if (sourceItem) {
			// 		// 移除原位置
			// 		// console.log('sourceItem.parent', sourceItem.parent);

			// 		// sourceItem.parent.splice(sourceItem.index, 1)


			// 		// 区分位置进行不同的插入操作
			// 		const cursorPosition = getCurrentCursorPositionInDomElement(event)
			// 		// console.log('cursorPosition', cursorPosition);


					// 在新位置插入
					// if (cursorPosition === CENTER) {
					// 	targetItem.data.children.unshift(sourceItem.data)
					// } else if (cursorPosition === TOP) {
					// 	targetItem.parent.splice(targetItem.index, 0, sourceItem.data)
					// } else if (cursorPosition === BOTTOM) {
					// 	targetItem.parent.splice(targetItem.index + 1, 0, sourceItem.data)
					// }

					// setData([...data])
			// 		clearTimeout(interval)


			// 	}
			// 	console.log('temp data', data);

			// }, 500);


		}

		event.preventDefault()
	}

	// 拖拽离开元素事件
	const onDragLeave = (event: any, item: any, index: number) => {
		// console.log('onDragLeave', event);
	}

	// 拖放事件
	const onDrop = (event: any, item: any, index: number) => {
		event.stopPropagation()
		event.preventDefault()
		// console.log('onDrop', event)
		setCurrentOverId(0)  // 清空overId

		if ( !canDrop ) {
			return
		}



		// 过滤自己拖自己
		if (currentDragId === item.id ) {
			return
		}

		// console.log('currentDragId', currentDragId)
		// console.log('拖拽id', event.dataTransfer?.getData('id'))
		const sourceId = event.dataTransfer?.getData('id')

		// console.log('item', item);


		const toChangeData = [...data]


		console.log('即将查找sourceItem', currentDragId);

		const sourceItem = dgFind(toChangeData, currentDragId)
		console.log('即将查找targetItem', item.id);
		const targetItem = dgFind(toChangeData, item.id)

		// console.log('sourceItem', sourceItem);
		// console.log('targetItem', targetItem);
		if (sourceItem) {
			// 移除原位置
			// console.log('sourceItem.parent', sourceItem.parent);

			sourceItem.parent.splice(sourceItem.index, 1)


			// 区分位置进行不同的插入操作
			const cursorPosition = getCurrentCursorPositionInDomElement(event)
			// console.log('cursorPosition', cursorPosition);


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
		// console.log('toChangeData', toChangeData);



		onUpdateData(toChangeData) // 深拷贝才能触发依赖data的重新渲染
	}

	// 移到元素上方时父元素变亮
	useEffect(()=>{

	}, [currentOverId])

	console.log('currentOverId', currentOverId);


	const RenderChildren = (props: any) => {
		const {item, index} = props
		if(item.children.length){
			return <div className={`item ${currentFocusId === item.id ? 'item-focused' : ''} ${item.opened?'item-opened':''} ${currentOverId === item.id ? 'item-over':''}`}
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
				<div className="item-place-holder"
					data-place-text={currentOverId === item.id ? `${currentDragItem?.name}`:''}
				>
					<span className="item-icon" />
					{item.name}
				</div>
				{item.opened && item.children.map((ele, index)=>RenderChildren({item: ele, index}))}
			</div>
		}
		return <div className={`item ${currentFocusId === item.id ? 'item-focused' : ''} ${item.opened ? 'item-opened' : ''} ${currentOverId === item.id ? 'item-over' : ''}`
		}
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
			<div className={`item-place-holder ${!canDrop?'placeholder-disabled':''}`}
				// data-place-text={currentOverId === item.id ? `${currentDragItem?.name}` : ''}
				data-place-text={currentOverId === item.id ? canDrop ? `${currentDragItem?.name}` : `${currentDragItem?.name}组件不能放置在${item.name}区域` : ''}
			>
				<span className="item-icon transparent" />
				{item.name}
			</div>
		</div>
	}

	return (
		<div className="list">
			{data.map((item, index) => RenderChildren({item, index}))}
		</div>
	)
}
