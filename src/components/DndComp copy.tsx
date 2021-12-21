import React, { useState, useEffect, useMemo } from 'react'
import { getCurrentCursorPositionInDomElement, TOP, CENTER, BOTTOM } from '~/utils/dnd'

export interface TreeData {
	name: string
	id: number
	children: Array<any>
}

interface IProps {
	data: TreeData[]
	onUpdateData: (data: TreeData[]) => void
	isOpen: boolean  // 是否展开
	parentId?: number  // 当前列表的父节点id 如果为最顶层则传空
}

const dgFind = (findData: any[], findId: string | number) => {
	let foundItem: any = undefined
	findData.forEach((item: any, index: number) => {
		console.log('对比', 'item.id', item.id, 'findId', findId);

		if (item.id.toString() === findId.toString()) {
			console.log('找到了，返回', item);

			foundItem = {
				parent: findData,
				data: item,
				index
			}
		}
		if (item.children) {
			const childrenItem = dgFind(item.children, findId)
			console.log('childrenItem', childrenItem);
			if (childrenItem) {
				foundItem = {
					parent: childrenItem.parent,
					data: childrenItem.data,
					index: childrenItem.index
				}
			}
		}
	})
	return foundItem
}

export default function DndComp(props: IProps) {

	const { data, onUpdateData, isOpen, parentId } = props

	const [currentDragId, setCurrentDragId] = useState(0)
	const [currentOverId, setCurrentOverId] = useState(0)
	const [currentFocusId, setCurrentFocusId] = useState(1) // 当前聚焦的节点，需要展开

	const handleItemClick = (event: any, item: any, index: number) => {
		event.stopPropagation()
		console.log('handleItemClick', 'item.id', item.id, 'currentFocusId', currentFocusId);

		if (item.id === currentFocusId) {
			setCurrentFocusId(0)
		} else {
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
			// 在新位置插入
			targetItem.data.children.unshift(sourceItem.data)
			setCurrentFocusId(targetItem.data.id)
		}
		console.log('toChangeData', toChangeData);


		setCurrentOverId(item.id)  // 清空overId

		onUpdateData(toChangeData) // 深拷贝才能触发依赖data的重新渲染
	}

	console.log('data in render', data);

	const onChildrenUpdateData = (data) => {
		console.log('onChildrenUpdateData', data);
	}

	useEffect(() => {
		console.log("Mounted")
	}, [])

	const toRenderData = useMemo(()=>{
		// 找到当前的层级
		return parentId ? dgFind(data, parentId).children : data
	}, [data])

	const RenderChildren = (props) => {
		return (
			<div></div>
		)
	}

	return (
		<div className="list">
			{
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
							{/* {
								 item.children && item.children.length ?
									<DndComp data={data} parentId={item.id} onUpdateData={onChildrenUpdateData}
										isOpen={[currentFocusId, currentOverId].includes(item.id)}
								/>
								:null
							} */}
							{
								[currentFocusId, currentOverId].includes(item.id) && item.children && item.children.map((cdItem, cdIndex) => {
									return (
										<div className="item"
											key={cdItem.id}
											onDragStart={(event) => onDragStart(event, cdItem, cdIndex)}
											onDragOver={(event) => onDragOver(event, cdItem, cdIndex)}
											onDragLeave={(event) => onDragLeave(event, cdItem, cdIndex)}
											onDrop={(event) => onDrop(event, cdItem, cdIndex)}
											draggable
											onClick={(event) => handleItemClick(event, cdItem, cdIndex)}
										>
											{cdItem.children.length ? '>' : ''}{cdItem.name}

											{
												[currentFocusId, currentOverId].includes(cdItem.id) && cdItem.children && cdItem.children.map((thirdItem, thirdIndex) => {
													return (
														<div className="item"
															key={thirdItem.id}
															onDragStart={(event) => onDragStart(event, thirdItem, thirdIndex)}
															onDragOver={(event) => onDragOver(event, thirdItem, thirdIndex)}
															onDragLeave={(event) => onDragLeave(event, thirdItem, thirdIndex)}
															onDrop={(event) => onDrop(event, thirdItem, thirdIndex)}
															draggable
															onClick={(event) => handleItemClick(event, thirdItem, thirdIndex)}
														>
															{thirdItem.children.length ? '>' : ''}{thirdItem.name}
															{
																[currentFocusId, currentOverId].includes(thirdItem.id) && thirdItem.children && thirdItem.children.map((fourthItem, fourthIndex) => {
																	return (
																		<div className="item"
																			key={fourthItem.id}
																			onDragStart={(event) => onDragStart(event, fourthItem, fourthIndex)}
																			onDragOver={(event) => onDragOver(event, fourthItem, fourthIndex)}
																			onDragLeave={(event) => onDragLeave(event, fourthItem, fourthIndex)}
																			onDrop={(event) => onDrop(event, fourthItem, fourthIndex)}
																			draggable
																			onClick={(event) => handleItemClick(event, fourthItem, fourthIndex)}
																		>
																			{fourthItem.children.length ? '>' : ''}{fourthItem.name}
																		</div>
																	)
																})
															}
														</div>
													)
												})
											}
										</div>
									)
								})
							}
						</div>
					)
				})
			}
		</div>
	)
}
