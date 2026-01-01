import React, { useState, useEffect } from 'react';
import SideBar from '../SideBar';
import API_POINT from '../../axiosConfig';
import { toast } from 'react-toastify';
import { 
  ComputerDesktopIcon, 
  ServerIcon, 
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  BuildingOfficeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

function Dashboard() {
  const [stats, setStats] = useState({
    totalDevices: 0,
    activeDevices: 0,
    inRepair: 0,
    condemned: 0,
    totalValue: 0,
    recentRegistrations: 0,
    warrantyExpiring: 0,
    divisions: 0
  });

  const [devicesByCategory, setDevicesByCategory] = useState([]);
  const [devicesByStation, setDevicesByStation] = useState([]);
  const [topBrands, setTopBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [
        statsRes,
        categoriesRes,
        stationsRes,
        brandsRes
      ] = await Promise.all([
        API_POINT.get('/dashboard/stats'),
        API_POINT.get('/dashboard/devices-by-category'),
        API_POINT.get('/dashboard/devices-by-station', { params: { limit: 10 } }),
        API_POINT.get('/dashboard/top-brands', { params: { limit: 5 } })
      ]);

      setStats(statsRes.data.data);
      setDevicesByCategory(categoriesRes.data.data);
      setDevicesByStation(stationsRes.data.data);
      setTopBrands(brandsRes.data.data);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = "blue" }) => {
    const colorClasses = {
      blue: "bg-blue-50 text-blue-600 border-blue-200",
      green: "bg-green-50 text-green-600 border-green-200",
      yellow: "bg-yellow-50 text-yellow-600 border-yellow-200",
      red: "bg-red-50 text-red-600 border-red-200",
      purple: "bg-purple-50 text-purple-600 border-purple-200",
      indigo: "bg-indigo-50 text-indigo-600 border-indigo-200"
    };

    return (
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
            {trend && (
              <div className="flex items-center mt-2">
                {trend === 'up' ? (
                  <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <ArrowTrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {trendValue}
                </span>
                <span className="text-xs text-gray-500 ml-1">vs last month</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-8 h-8" />
          </div>
        </div>
      </div>
    );
  };

  const ProgressBar = ({ label, value, total, color = "blue" }) => {
    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
    
    const colorClasses = {
      blue: "bg-blue-500",
      green: "bg-green-500",
      yellow: "bg-yellow-500",
      red: "bg-red-500",
      purple: "bg-purple-500"
    };

    return (
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-sm font-semibold text-gray-900">{value} ({percentage}%)</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full ${colorClasses[color]} transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <SideBar page="Dashboard">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </SideBar>
    );
  }

  if (error) {
    return (
      <SideBar page="Dashboard">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Dashboard</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </SideBar>
    );
  }

  return (
    <SideBar page="Dashboard">
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">IT Asset Management Dashboard</h1>
          <p className="text-blue-100">ABC Police - IT Division</p>
          <p className="text-sm text-blue-200 mt-1">
            Last Updated: {new Date().toLocaleString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Devices"
            value={stats.totalDevices}
            icon={ComputerDesktopIcon}
            trend="up"
            trendValue="+12%"
            color="blue"
          />
          <StatCard
            title="Active Devices"
            value={stats.activeDevices}
            icon={CheckCircleIcon}
            trend="up"
            trendValue="+8%"
            color="green"
          />
          <StatCard
            title="Under Repair"
            value={stats.inRepair}
            icon={ExclamationTriangleIcon}
            trend="down"
            trendValue="-5%"
            color="yellow"
          />
          <StatCard
            title="Total Asset Value"
            value={`LKR ${(stats.totalValue / 1000000).toFixed(1)}M`}
            icon={ChartBarIcon}
            trend="up"
            trendValue="+15%"
            color="purple"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Recent Registrations"
            value={stats.recentRegistrations}
            icon={ClockIcon}
            color="indigo"
          />
          <StatCard
            title="Warranty Expiring (30d)"
            value={stats.warrantyExpiring}
            icon={ExclamationTriangleIcon}
            color="red"
          />
          <StatCard
            title="Active Divisions"
            value={stats.divisions}
            icon={BuildingOfficeIcon}
            color="green"
          />
          <StatCard
            title="Condemned Assets"
            value={stats.condemned}
            icon={ExclamationTriangleIcon}
            color="red"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Devices by Category</h2>
              <ChartBarIcon className="w-6 h-6 text-gray-400" />
            </div>
            <div className="space-y-1">
              {devicesByCategory.map((category, index) => (
                <ProgressBar
                  key={category.category_id}
                  label={category.category_name}
                  value={category.count}
                  total={stats.totalDevices}
                  color={['blue', 'green', 'purple', 'yellow', 'red'][index % 5]}
                />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Top Brands</h2>
              <ChartBarIcon className="w-6 h-6 text-gray-400" />
            </div>
            <div className="space-y-4">
              {topBrands.map((brand, index) => (
                <div key={brand.brand_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-900">{brand.brand_name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{brand.count}</p>
                    <p className="text-xs text-gray-500">
                      {Math.round((brand.count / stats.totalDevices) * 100)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Top Stations</h2>
              <BuildingOfficeIcon className="w-6 h-6 text-gray-400" />
            </div>
            <div className="space-y-1">
              {devicesByStation.slice(0, 10).map((station, index) => (
                <ProgressBar
                  key={station.station_id}
                  label={station.station_name}
                  value={station.count}
                  total={Math.max(...devicesByStation.map(s => s.count))}
                  color={index < 3 ? 'blue' : 'gray'}
                />
              ))}
            </div>
          </div>
          
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Device Health Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <CheckCircleIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">{stats.activeDevices}</p>
              <p className="text-sm text-gray-600 mt-1">Active</p>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round((stats.activeDevices / stats.totalDevices) * 100)}%
              </p>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <ExclamationTriangleIcon className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-yellow-600">{stats.inRepair}</p>
              <p className="text-sm text-gray-600 mt-1">In Repair</p>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round((stats.inRepair / stats.totalDevices) * 100)}%
              </p>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-600">{stats.condemned}</p>
              <p className="text-sm text-gray-600 mt-1">Condemned</p>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round((stats.condemned / stats.totalDevices) * 100)}%
              </p>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <ServerIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">
                {stats.totalDevices - stats.activeDevices - stats.inRepair - stats.condemned}
              </p>
              <p className="text-sm text-gray-600 mt-1">In Storage</p>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round(((stats.totalDevices - stats.activeDevices - stats.inRepair - stats.condemned) / stats.totalDevices) * 100)}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </SideBar>
  );
}

export default Dashboard;