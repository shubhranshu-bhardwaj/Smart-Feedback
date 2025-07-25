import React, { useEffect, useState } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement } from 'chart.js';
import { FaUserAlt, FaArrowLeft, FaLayerGroup, FaClipboardList } from "react-icons/fa";
import API from '../api/api';
import { Link } from 'react-router-dom';
import './AdminAnalytics.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    LineElement,
    PointElement
);

interface Feedback {
    id: number;
    heading: string;
    category: string;
    subcategory: string;
    message: string;
    submittedAt: string;
    status: string;
    fullName: string;
    email: string;
    imageUrl?: string;
}

const AdminAnalytics: React.FC = () => {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dateRange, setDateRange] = useState('7');

    useEffect(() => {
        const fetchFeedbacks = async () => {
            try {
                const res = await API.get('/admin/all-feedbacks');
                setFeedbacks(res.data);
            } catch (err) {
                console.error('Error fetching feedbacks:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchFeedbacks();
    }, []);

    const filteredFeedbacks = feedbacks.filter(fb => {
        const submittedDate = new Date(fb.submittedAt);
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(dateRange));
        return submittedDate >= daysAgo;
    });

    const totalCount = filteredFeedbacks.length;

    const categoryCounts = filteredFeedbacks.reduce((acc: Record<string, number>, fb) => {
        acc[fb.category] = (acc[fb.category] || 0) + 1;
        return acc;
    }, {});

    const subcategoryCounts = filteredFeedbacks.reduce((acc: Record<string, number>, fb) => {
        acc[fb.subcategory] = (acc[fb.subcategory] || 0) + 1;
        return acc;
    }, {});

    const dailyTrendMap = filteredFeedbacks.reduce((acc: Record<string, number>, fb) => {
        const date = new Date(fb.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {});

    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const dailyTrendData = last7Days.map(date => dailyTrendMap[date] || 0);

    const userSubmissions = filteredFeedbacks.reduce((acc: Record<string, number>, fb) => {
        acc[fb.fullName] = (acc[fb.fullName] || 0) + 1;
        return acc;
    }, {});

    const mostActiveUser = Object.keys(userSubmissions).length > 0
        ? Object.keys(userSubmissions).reduce((a, b) => userSubmissions[a] > userSubmissions[b] ? a : b)
        : 'N/A';

    const lineChartData = {
        labels: last7Days,
        datasets: [
            {
                label: 'Feedbacks Submitted',
                data: dailyTrendData,
                borderColor: '#6366F1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#6366F1',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 5,
            },
        ],
    };


    const barChartData = {
        labels: Object.keys(categoryCounts),
        datasets: [
            {
                label: 'Feedback Count',
                data: Object.values(categoryCounts),
                backgroundColor: ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B'],
                borderRadius: 8,
                borderWidth: 0,
            },
        ],
    };

    const subcategoryChartData = {
        labels: Object.keys(subcategoryCounts).slice(0, 5),
        datasets: [
            {
                data: Object.values(subcategoryCounts).slice(0, 5),
                backgroundColor: ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'],
                borderWidth: 2,
                borderColor: '#ffffff',
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    padding: 20,
                    usePointStyle: true,
                },
            },
        },
    };

    const barChartOptions = {
        ...chartOptions,
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                },
            },
        },
    };

    if (isLoading) {
        return (
            <div className="loading-screen">
                <div className="loading-content">
                    <div className="spinner"></div>
                    <p>Loading analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-analytics-container">
            <div className="dashboard-header">
                <div>
                    <h1 className="analytics-title">Analytics <span>Dashboard</span></h1>
                    <p className="analytics-subtitle">Comprehensive feedback analytics and insights</p>
                </div>
                <div className="header-controls">
                    <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="analytics-select">
                        <option value="7">Last 7 days</option>
                        <option value="30">Last 30 days</option>
                        <option value="90">Last 90 days</option>
                        <option value="365">Last year</option>
                    </select>
                    <Link to="/admin">
                        <button className="analytics-button"> <FaArrowLeft /> Back to Dashboard</button>
                    </Link>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="kpi-grid">
                <div className="kpi-card bg-indigo-purple">
                    <h4> <FaClipboardList /> Total Feedbacks</h4>
                    <p>{totalCount}</p>
                </div>
                <div className="kpi-card bg-green-teal">
                    <h4> <FaUserAlt /> Most Active User</h4>
                    <p>{mostActiveUser}</p>
                    <p className="count-text">
                        {mostActiveUser !== 'N/A' ? `${userSubmissions[mostActiveUser]} submissions` : 'No submissions yet'}
                    </p>
                </div>
                <div className="kpi-card bg-orange-red">
                    <h4> <FaLayerGroup /> Top Category</h4>
                    <p>
                        {Object.keys(categoryCounts).length > 0
                            ? Object.entries(categoryCounts).reduce((a, b) => (a[1] > b[1] ? a : b))[0]
                            : 'N/A'}
                    </p>
                    <p className="count-text">
                        {Object.keys(categoryCounts).length > 0
                            ? `${Math.max(...Object.values(categoryCounts))} submissions`
                            : 'No data'}
                    </p>
                </div>
            </div>

            {/* Charts */}
            <div className="charts-grid">

                <div className="dual-chart-row">
                    <div className="chart-card">
                        <h3 className="chart-title">Feedback by Category</h3>
                        <Bar data={barChartData} options={barChartOptions} />
                    </div>
                    <div className="chart-card">
                        <h3 className="chart-title">Top Subcategories</h3>
                        <Doughnut data={subcategoryChartData} options={chartOptions} />
                    </div>
                </div>

                <div className="chart-card">
                    <h3 className="chart-title">Daily Feedback Trend</h3>
                    <Line data={lineChartData} options={chartOptions} />
                </div>
            </div>
        </div>
    );
}

export default AdminAnalytics;
