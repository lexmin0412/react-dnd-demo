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
	 * 子元素
	 */
	children: Array<any>
}

interface IProps {
	data: TreeData[]
	onUpdateData: (data: TreeData[]) => void
	isOpen: boolean  // 是否展开
	parentId?: number  // 当前列表的父节点id 如果为最顶层则传空
}

const dgFind = (findData: any[], findId: string | number, idMap?: string[]) => {
	let foundItem: any = undefined
	if ( !idMap ) {
		idMap = []
	}
	findData.forEach((item: any, index: number) => {
		console.log('对比', 'item.id', item.id, 'findId', findId);
		console.log('idMap in forEach', idMap);


		if (item.id.toString() === findId.toString()) {
			idMap.push(item.id)
			console.log('找到了，返回', item);

			foundItem = {
				parent: findData,
				data: item,
				index,
				idMap
			}
			idMap = []
		} else if (item.children.length) {
			idMap.push(item.id)
			const childrenItem = dgFind(item.children, findId, idMap)
			console.log('childrenItem', childrenItem, item.id);
			if (childrenItem) {
				foundItem = childrenItem
				idMap = []
			} else {
				console.log('当前节点为根节点，重置', item.id);
				idMap = []
			}
		} else {
			console.log('当前节点为根节点，重置', item.id);

			idMap = []
		}
	})
	return foundItem
}

export default function DndComp(props: IProps) {

	const { data, onUpdateData, isOpen, parentId } = props

	console.log('data in DndComp', data);


	const [currentDragId, setCurrentDragId] = useState(0)
	const [currentOverId, setCurrentOverId] = useState(0)
	const [currentFocusId, setCurrentFocusId] = useState(data[0].id) // 当前聚焦的节点，需要展开
	// const [ openedKeys, setOpenedKeys ] = useState([])

	const handleItemClick = (event: any, item: any, index: number) => {
		event.stopPropagation()
		console.log('handleItemClick', 'item.id', item.id, 'currentFocusId', currentFocusId);

		// setCurrentFocusId(0)
		if (item.id !== currentFocusId) {
			setCurrentFocusId(item.id)
		}
	}

	console.log('into render: currentDragId:', currentDragId);


	// 拖拽开始事件
	const onDragStart = (event: any, item: any, index: number) => {
		console.warn('onDragStart', event);
		console.log('item.id', item.id);
		event.stopPropagation()  // 防止冒泡触发父元素事件
		event.dataTransfer?.setData('id', item.id)
		setCurrentDragId(item.id)
	}

	// 拖拽移动到元素上方事件
	const onDragOver = (event: any, item: any, index: number) => {
		event.stopPropagation()
		if (item.id !== currentOverId) {
			console.log('onDragOver', event);
			setCurrentOverId(item.id)
		}

		event.preventDefault()
	}

	// 拖拽离开元素事件
	const onDragLeave = (event: any, item: any, index: number) => {
		console.log('onDragLeave', event);
	}

	// 拖放事件
	const onDrop = (event: any, item: any, index: number) => {
		event.stopPropagation()
		event.preventDefault()
		console.log('onDrop', event)

		console.log('currentDragId', currentDragId)
		console.log('拖拽id', event.dataTransfer?.getData('id'))
		const sourceId = event.dataTransfer?.getData('id')

		console.log('item', item);

		const toChangeData = [...data]


		const sourceItem = dgFind(toChangeData, sourceId)
		const targetItem = dgFind(toChangeData, item.id)

		console.log('sourceItem', sourceItem);
		console.log('targetItem', targetItem);
		if (sourceItem) {
			// 移除原位置
			console.log('sourceItem.parent', sourceItem.parent);

			sourceItem.parent.splice(sourceItem.index, 1)


			// 区分位置进行不同的插入操作
			const cursorPosition = getCurrentCursorPositionInDomElement(event)
			console.log('cursorPosition', cursorPosition);


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
		console.log('toChangeData', toChangeData);


		setCurrentOverId(item.id)  // 清空overId

		onUpdateData(toChangeData) // 深拷贝才能触发依赖data的重新渲染
	}


	useEffect(() => {
		console.log("Mounted")
	}, [])

	// 将当前聚焦和经过的层级及其父节点全部打开
	const openedKeys = useMemo(()=>{
		const keys = []

		// 聚焦节点依次向上查找
		const focusedItem = dgFind(data, currentFocusId)
		console.log('focusedItem', focusedItem);


		if (focusedItem) {
			keys.push(...focusedItem.idMap)
		}

		return keys


	}, [currentFocusId, currentOverId])

	// 移到元素上方时父元素变亮
	useEffect(()=>{

	}, [currentOverId])


	console.log('openedKeys', openedKeys);


	// const toRenderData = useMemo(()=>{
	// 	// 找到当前的层级
	// 	return parentId ? dgFind(data, parentId).children : data
	// }, [data])

	const RenderChildren = (props: any) => {
		const {item, index} = props
		if(item.children.length){
			return <div className={`item ${currentFocusId === item.id ? 'item-focused' : ''} ${openedKeys.includes(item.id)?'item-opened':''}`}
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
				<div className="item-place-holder">
					<span className="item-icon" />
					{item.name}
				</div>
				{openedKeys.includes(item.id) && item.children.map((ele, index)=>RenderChildren({item: ele, index}))}
			</div>
		}
		return <div className={`item ${currentFocusId === item.id ? 'item-focused' : ''} ${openedKeys.includes(item.id) ? 'item-opened' : ''}`}
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
			<div className="item-place-holder">
				<span className="item-icon transparent" />
				{item.name}
			</div>
		</div>
	}

	return (
		<div className="list">
			{data.map((item, index) => RenderChildren({item, index}))}
			{/* {
				// 找到对应层级的数据进行渲染
				toRenderData.map((item, index)=>{
					return (
						<div className="item"
							data-id={item.id}
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
							{item.children.length ? '>' : ''}{item.name}

							{
								item.children && item.children.map((ele)=>{
									return RenderChildren(ele)
								})
							}

							{/* {RenderChildren({

							})} */}
							{/* {
								 item.children && item.children.length ?
									<DndComp data={data} parentId={item.id} onUpdateData={onChildrenUpdateData}
										isOpen={[currentFocusId, currentOverId].includes(item.id)}
								/>
								:null
						</div>
					)
				})
			} */}
		</div>
	)
}
