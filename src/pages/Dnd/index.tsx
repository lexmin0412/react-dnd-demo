import React, { useState, useEffect } from 'react'
import DndComp, { TreeData } from '~/components/DndComp_clean'
import './index.less'

const defaultData: TreeData[] = [
	{
		title: 'item1', id: 1,
		opened: true, children: [
			{
				title: 'item1-1',
				id: 1.1,
				children: [
					{
						title: 'item1-1-1',
						id: '1.1.1',
						children: []
					},
					{
						title: 'item1-1-2',
						id: '1.1.2',
						children: []
					},
				]
			}
		]
	},
	{title: 'item2', id: 2, children: []},
	{
		title: 'item3', id: 3, children: [
			{
				title: 'item3-1',
				id: 3.1,
				children: []
			}
		], showChildren: true
	},
	{title: 'item4', id: 4, children: []},
	{title: 'item5', id: 5, children: []},
]

export default function Index() {
	const [data, setData] = useState<TreeData[]>(defaultData)

	return (
		<div>
			<DndComp
				data={data}
				onUpdateData={(data: TreeData[])=>setData(data)}
				isOpen={true}
				renderItem={({item, placeholder})=>{
					const isLeaf = !(item.children && item.children.length)
					return (
						<div className={`item-place-holder ${placeholder.disabled ? 'placeholder-disabled':''}`}
							data-place-text={placeholder.text}
						>
							<span className={`item-icon ${isLeaf ? 'transparent': ''}`} />
							{item.title}
						</div>
					)
				}}
			/>
		</div>
	)
}
