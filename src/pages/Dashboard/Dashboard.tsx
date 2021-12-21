import React, {useEffect, useState} from 'react'
import NumberAnimation from '~/components/NumberAnimation'
import DashboardCard from '~/components/DashboardCard'
import { getTotalVisitCount } from '~/services/visit.service'
import './Dashboard.less'
import {
	Link
} from 'react-router-dom'

const Dashboard = () => {

	const [totalVisitCount, setTotalVisitCount] = useState(0)
	const [todayIncreaseVisitCount, settodayIncreaseVisitCount] = useState(0)

	// 获取访问总人数
	const queryTotalVisitCount = () => {
		getTotalVisitCount().then((res: any)=>{
			setTotalVisitCount(res.count)
			settodayIncreaseVisitCount(res.today_incr)
		})
	}

	useEffect(()=>{
		queryTotalVisitCount()
	}, [])

	return (
		<div className='dashboard-container'>

		</div>
	)
}

export default Dashboard
