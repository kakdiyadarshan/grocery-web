import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ShoppingCart, XCircle, CheckCircle2, Clock, Calendar, ChevronDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import DataTable from '../component/DataTable';
import {
  PieChart, Pie, Sector, ResponsiveContainer, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList
} from 'recharts';
import ReactApexChart from 'react-apexcharts';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders } from '../../redux/slice/order.slice';
import { fetchOrderMonthlyAnalytics, fetchRevenueAnalytics } from '../../redux/slice/dashboard.slice';
import { getAllProducts } from '../../redux/slice/product.slice';
import { FiPackage, FiClock, FiShoppingCart, } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { getAllCategories } from '../../redux/slice/category.slice';
import { Sparklines, SparklinesBars, SparklinesLine } from 'react-sparklines';
import AdminLoader from '../component/AdminLoader';



const COLORS = ['#228B22', '#fbbf24', '#ef4444', "#70bb70"];

const formatCompact = (val) => {
  if (val >= 1000000) return `$${(val / 1000000).toFixed(val % 1000000 === 0 ? 0 : 1)}M`;
  if (val >= 1000) return `$${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}k`;
  return `$${val}`;
};
const barColors = ['#228B22'];

const getPath = (x, y, width, height) => {
  return `M${x},${y + height}C${x + width / 3},${y + height} ${x + width / 2},${y + height / 3}
  ${x + width / 2}, ${y}
  C${x + width / 2},${y + height / 3} ${x + (2 * width) / 3},${y + height} ${x + width}, ${y + height}
  Z`;
};

const TriangleBar = (props) => {
  const { x, y, width, height, index } = props;
  const color = barColors[index % barColors.length];
  return <path d={getPath(x, y, width, height)} stroke="none" fill={color} />;
};

const renderActiveShape = (props) => {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent, value
  } = props;

  const revenueFormatted = payload.revenue >= 1000
    ? `$${(payload.revenue / 1000).toFixed(1).replace(/\.0$/, '')}k`
    : `$${payload.revenue?.toLocaleString() || '0'}`;

  return (
    <g>
      <text x={cx} y={cy} dy={-24} textAnchor="middle" fill={fill} className="text-[13px] font-extrabold uppercase tracking-widest">
        {payload.name}
      </text>
      <text x={cx} y={cy} dy={4} textAnchor="middle" fill="#0f172a" className="text-[26px] font-black tracking-tight">
        {value}
      </text>
      <text x={cx} y={cy} dy={24} textAnchor="middle" fill="#10b981" className="text-[14px] font-bold">
        {revenueFormatted}
      </text>
      <text x={cx} y={cy} dy={42} textAnchor="middle" fill="#94a3b8" className="text-[11px] font-bold">
        (${(percent * 100).toFixed(1)}%)
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={innerRadius - 4}
        outerRadius={innerRadius}
        fill={fill}
      />
    </g>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch()

  const { allorders, loading } = useSelector((state) => state.order);
  const { monthlyAnalytics, revenueAnalytics, loading: dashboardLoading } = useSelector((state) => state.dashboard);
  const { categories, loading: categoryLoading } = useSelector((state) => state.category);
  const { products } = useSelector((state) => state.product);

  const currentYearStr = new Date().getFullYear().toString();
  const [selectedYear, setSelectedYear] = useState(currentYearStr);

  useEffect(() => {
    dispatch(fetchOrders())
    dispatch(getAllCategories())
    dispatch(fetchRevenueAnalytics())
    dispatch(getAllProducts())
  }, [dispatch])

  useEffect(() => {
    dispatch(fetchOrderMonthlyAnalytics(selectedYear));
  }, [dispatch, selectedYear]);

  const [primaryColor, setPrimaryColor] = useState('');

  useEffect(() => {
    const color = getComputedStyle(document.documentElement)
      .getPropertyValue('--primary')
      .trim();
    setPrimaryColor(color);
  }, []);

  const barData = monthlyAnalytics?.length > 0
    ? monthlyAnalytics.map(item => ({ name: item.month, orders: item.totalOrders }))
    : [
      { name: 'Jan', orders: 0 }, { name: 'Feb', orders: 0 }, { name: 'Mar', orders: 0 },
      { name: 'Apr', orders: 0 }, { name: 'May', orders: 0 }, { name: 'Jun', orders: 0 },
      { name: 'Jul', orders: 0 }, { name: 'Aug', orders: 0 }, { name: 'Sep', orders: 0 },
      { name: 'Oct', orders: 0 }, { name: 'Nov', orders: 0 }, { name: 'Dec', orders: 0 },
    ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobileSize = windowWidth < 768;
  const isSmallSize = windowWidth < 640;

  // Group data by 3-month intervals for small screens
  const groupedBarData = [
    { name: 'Jan-Mar', orders: barData.slice(0, 3).reduce((sum, item) => sum + item.orders, 0) },
    { name: 'Apr-Jun', orders: barData.slice(3, 6).reduce((sum, item) => sum + item.orders, 0) },
    { name: 'Jul-Sep', orders: barData.slice(6, 9).reduce((sum, item) => sum + item.orders, 0) },
    { name: 'Oct-Dec', orders: barData.slice(9, 12).reduce((sum, item) => sum + item.orders, 0) },
  ];

  const displayedBarData = isSmallSize ? groupedBarData : barData;

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const pieData = useMemo(() => {
    if (!allorders || allorders.length === 0) return [
      { name: 'COD', value: 0, revenue: 0 },
      { name: 'Stripe', value: 0, revenue: 0 }
    ];

    let cod = 0;
    let codRev = 0;
    let stripe = 0;
    let stripeRev = 0;

    allorders.forEach(o => {
      if (o.status === 'cancelled') return;
      if (o.paymentMethod === 'COD') {
        cod++;
        codRev += o.totalAmount || 0;
      }
      else if (o.paymentMethod === 'Stripe') {
        stripe++;
        stripeRev += o.totalAmount || 0;
      }
    });

    const hasData = cod > 0 || stripe > 0;

    // If absolutely no payment methods have been processed, show fallback so chart isn't empty visually
    if (!hasData) return [
      { name: 'COD', value: 1, revenue: 0 },
      { name: 'Stripe', value: 0, revenue: 0 }
    ];

    return [
      { name: 'COD', value: cod, revenue: codRev },
      { name: 'Stripe', value: stripe, revenue: stripeRev }
    ];
  }, [allorders]);

  const categoryDistribution = useMemo(() => {
    if (!products || !categories) return { names: [], counts: [] };

    const countsMap = {};
    categories.forEach(c => { countsMap[c._id] = 0; });

    products.forEach(product => {
      if (product.category) {
        const catId = product.category._id || product.category;
        if (countsMap[catId] !== undefined) {
          countsMap[catId] += 1;
        }
      }
    });

    const sorted = categories
      .map(c => ({ name: c.categoryName, count: countsMap[c._id] || 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      names: sorted.map(c => c.name),
      counts: sorted.map(c => c.count)
    };
  }, [products, categories]);

  const topSellingProducts = useMemo(() => {
    if (!allorders) return [];

    const productCounts = {};

    allorders.forEach(order => {
      if (order.status === 'cancelled') return;
      order.items?.forEach(item => {
        const product = item.productId || item.product;
        if (product && product._id) {
          if (!productCounts[product._id]) {
            productCounts[product._id] = {
              name: product.name,
              img: product.images?.[0]?.url || '🛒',
              quantity: 0,
              revenue: 0
            };
          }
          const qty = item.quantity || 1;
          const price = item.price || item.selectedVariant?.price || item.selectedVariant?.discountPrice || product.weighstWise?.[0]?.price || 0;
          productCounts[product._id].quantity += qty;
          productCounts[product._id].revenue += qty * price;
        }
      });
    });

    return Object.values(productCounts)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 7);
  }, [allorders]);

  const [activeTimeframe, setActiveTimeframe] = useState('Weekly');
  const [activePaymentTimeframe, setActivePaymentTimeframe] = useState('Weekly');

  const analyticsData = revenueAnalytics || {
    Weekly: {
      categories: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
      series: [0, 0, 0, 0, 0, 0, 0],
      codSeries: [0, 0, 0, 0, 0, 0, 0],
      stripeSeries: [0, 0, 0, 0, 0, 0, 0],
      total: 0,
      growth: 0
    },
    Monthly: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      series: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      codSeries: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      stripeSeries: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      total: 0,
      growth: 0
    },
    Yearly: {
      categories: ['2021', '2022', '2023', '2024', '2025'],
      series: [0, 0, 0, 0, 0],
      codSeries: [0, 0, 0, 0, 0],
      stripeSeries: [0, 0, 0, 0, 0],
      total: 0,
      growth: 0
    }
  };

  const columns = useMemo(() => [
    {
      header: 'Order Info',
      accessor: '_id',
      searchKey: (data) => data._id + " " + data.user?.username,
      render: (data) => (
        <div className="flex flex-col gap-0.5">
          <div className="font-bold text-textPrimary">
            #{data._id.slice(-6).toUpperCase()}
          </div>
          <div className='text-xs text-textSecondary'>
            By: {data.userId?.firstname + " " + data.userId?.lastname || 'Unknown User'}
          </div>
        </div>
      )
    },
    {
      header: 'Order Date',
      accessor: 'createdAt',
      render: (data) => (
        <div className="flex items-center gap-2 text-textSecondary">
          <FiClock size={12} className="text-textSecondary opacity-60" />
          <span className="text-xs font-medium">
            {new Date(data.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      )
    },
    {
      header: 'Items',
      searchKey: (data) => data.items?.map((item) => item.productId?.name).join(' '),
      accessor: 'items',
      render: (data) => (
        <div className="flex items-center gap-3">
          <div className="flex -space-x-3 overflow-hidden">
            {data.items?.slice(0, 2).map((item, i) => (
              <div
                key={i}
                className="relative inline-block h-9 w-9 rounded-full ring-2 ring-white overflow-hidden bg-gray-100 shadow-sm transition-transform border border-primary"
                title={item.productId?.name}
              >
                {item.productId?.images?.[0]?.url ? (
                  <img
                    src={item.productId.images[0].url}
                    alt={item.productId.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center  justify-center text-xs text-gray-400">
                    <FiPackage />
                  </div>
                )}
              </div>
            ))}

            {data.items?.length > 2 && (
              <div className="relative  h-9 w-9 border border-primary rounded-full ring-2 ring-white  bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">
                +{data.items.length - 2}
              </div>
            )}
          </div>
          <div className='text-xs flex items-center text-gray-500 whitespace-nowrap self-center pl-2 !ml-1'>
            {data.items?.length} items
          </div>
        </div>
      )
    },
    {
      header: 'Total',
      accessor: 'totalAmount',
      render: (data) => (
        <div className="text-sm font-medium text-textPrimary">
          ${data.totalAmount.toFixed(2)}
        </div>
      )
    },
    {
      header: 'Order Status',
      accessor: 'status',
      render: (data) => (
        <span className={`px-2 py-0.5 rounded-[4px] text-xs font-medium border capitalize
                  ${data.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-200' :
            data.status === 'processing' ? 'bg-blue-50 text-blue-700 border-blue-200' :
              data.status === 'shipped' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                data.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                  'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
          {data.status}
        </span>
      )
    }
  ], []);

  const handleView = useCallback((item) => {
    navigate(`/admin/orders/${item._id}`);
  }, [navigate]);

  if (loading) {
    return <AdminLoader message="Loading Dashboard..." icon={FiShoppingCart} />;
  }

  return (
    <div className="py-8 w-full min-h-screen text-slate-800">
      {/* Top Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {(() => {
          const total = allorders.length || 1;
          const cancelled = allorders.filter(order => order.status === 'cancelled').length;
          const completed = allorders.filter(order => order.status === 'delivered' || order.status === 'completed').length;
          const pending = allorders.filter(order => order.status === 'pending' || order.status === 'processing' || order.status === 'shipped' || order.status === 'out for delivery').length;

          return (
            <>
              <MetricCard
                title="Total Orders"
                value={allorders.length}
                percentage={100}
                color={primaryColor}
              />
              <MetricCard
                title="Order Cancelled"
                value={cancelled}
                percentage={(cancelled / total) * 100}
                color={primaryColor}
              />
              <MetricCard
                title="Order Completed"
                value={completed}
                percentage={(completed / total) * 100}
                color={primaryColor}
              />
              <MetricCard
                title="Order Pending"
                value={pending}
                percentage={(pending / total) * 100}
                color={primaryColor}
              />
            </>
          );
        })()}
      </div>


      {/* ____________________________________________________________________________________________ */}

      {/* top chart 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Orders Analytics */}
        <div className="lg:col-span-2 rounded-md bg-white p-4 border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold">Orders Analytics</h3>
            <div className="flex items-center gap-6">
              <CustomSelect
                options={[currentYearStr, (Number(currentYearStr) - 1).toString(), (Number(currentYearStr) - 2).toString(), (Number(currentYearStr) - 3).toString()]}
                defaultValue={selectedYear}
                onChange={(year) => setSelectedYear(year)}
              />
            </div>

          </div>
          <div className="h-80 relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={displayedBarData}
                margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickFormatter={(val) => formatCompact(val).replace('$', '')}
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar
                  dataKey="orders"
                  shape={<TriangleBar />}
                  label={{ position: 'top', fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Revenue Trend (Line Chart) */}
        <div className="bg-white rounded-md p-4 border border-slate-100 flex flex-col">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <h3 className="text-xl font-bold">Payment Methods Trend</h3>
            <CustomSelect
              options={['Weekly', 'Monthly', 'Yearly']}
              defaultValue={activePaymentTimeframe}
              onChange={(v) => setActivePaymentTimeframe(v)}
            />
          </div>
          <div className="flex-1 w-full min-h-[300px]">
            <ReactApexChart
              options={{
                chart: {
                  type: 'bar',
                  toolbar: { show: false },
                  zoom: { enabled: false }
                },
                plotOptions: {
                  bar: {
                    horizontal: false,
                    columnWidth: '55%',
                    borderRadius: 2
                  }
                },
                dataLabels: {
                  enabled: false
                },
                colors: [primaryColor, '#726bff'],
                xaxis: {
                  categories: analyticsData[activePaymentTimeframe]?.categories || [],
                  axisBorder: { show: false },
                  axisTicks: { show: false },
                },
                yaxis: {
                  labels: {
                    formatter: (val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val
                  }
                },
                grid: {
                  borderColor: '#f1f5f9',
                  strokeDashArray: 4,
                  yaxis: { lines: { show: true } },
                  xaxis: { lines: { show: false } }
                },
                legend: {
                  position: 'bottom',
                  horizontalAlign: 'center',
                  fontSize: '12px',
                  fontWeight: 600,
                  markers: { radius: 4 }
                }
              }}
              series={[
                { name: 'COD Revenue', data: analyticsData[activePaymentTimeframe]?.codSeries || [] },
                { name: 'Stripe Revenue', data: analyticsData[activePaymentTimeframe]?.stripeSeries || [] }
              ]}
              type="bar"
              height={300}
            />
          </div>
        </div>
      </div>


      {/* ____________________________________________________________________________________________ */}

      {/* bottom chart */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">


        <div className="bg-white rounded-md p-4 border border-slate-100 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Category Distribution</h3>
          </div>
          <div className="w-full">
            <ReactApexChart
              options={{
                chart: {
                  type: 'bar',
                  height: 350,
                  dropShadow: {
                    enabled: false,
                  },
                  toolbar: {
                    show: false
                  }
                },
                plotOptions: {
                  bar: {
                    borderRadius: 4,
                    horizontal: false,
                    distributed: true,
                    barHeight: '60%',
                    isFunnel: false,
                  },
                },
                colors: [
                  primaryColor,
                ],
                dataLabels: {
                  enabled: false,
                },
                xaxis: {
                  categories: categoryDistribution.names,
                  axisBorder: { show: false },
                  axisTicks: { show: false },
                  labels: { show: false }
                },
                tooltip: {
                  custom: function ({ series, seriesIndex, dataPointIndex, w }) {
                    return '<div class="px-3 py-2 bg-white border border-slate-100 rounded-lg shadow-lg font-bold text-xs text-slate-700">' +
                      w.globals.labels[dataPointIndex] + ': <span style="color: ' + primaryColor + '">' + series[seriesIndex][dataPointIndex] + ' Products</span>' +
                      '</div>';
                  }
                },
                yaxis: {
                  labels: {
                    style: {
                      fontSize: '11px',
                      fontWeight: 600,
                      fontFamily: 'Jost, sans-serif',
                      colors: ['#64748b']
                    }
                  }
                },
                legend: {
                  show: false,
                },
                grid: {
                  show: false,
                  padding: {
                    left: 5,
                    right: 0
                  }
                },
                responsive: [
                  {
                    breakpoint: 480,
                    options: {
                      chart: {
                        height: 480
                      },
                      yaxis: {
                        labels: {
                          style: {
                            fontSize: '11px',
                          }
                        }
                      }
                    }
                  }
                ]
              }}
              series={[
                {
                  name: "Total Products",
                  data: categoryDistribution.counts,
                },
              ]}
              type="bar"
              height={350}
            />
          </div>
        </div>

        {/* Revenue */}
        <div className="lg:col-span-2 rounded-md bg-white p-4 border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Revenue</h3>
            <CustomSelect
              options={['Weekly', 'Monthly', 'Yearly']}
              defaultValue={activeTimeframe}
              onChange={(v) => setActiveTimeframe(v)}
            />
          </div>

          {/* Metric Header */}
          <div className="flex items-center gap-4 mb-6">
            <h2 className="sm:text-3xl text-xl font-bold">
              ${analyticsData[activeTimeframe]?.total?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </h2>
            <div className={`flex items-center px-2 py-1 rounded-full text-xs font-bold gap-1 border ${analyticsData[activeTimeframe]?.growth >= 0
              ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
              : 'bg-red-50 text-red-600 border-red-100'
              }`}>
              {analyticsData[activeTimeframe]?.growth >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(analyticsData[activeTimeframe]?.growth || 0).toFixed(2)}%
            </div>
          </div>

          <div className="flex-1 w-full min-h-[300px]">
            <ReactApexChart
              options={{
                chart: {
                  type: 'area',
                  toolbar: { show: false },
                  zoom: { enabled: false },
                  fontFamily: 'Jost, sans-serif'
                },
                stroke: {
                  curve: 'smooth',
                  width: 4,
                  colors: [primaryColor]
                },
                fill: {
                  type: 'gradient',
                  gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.45,
                    opacityTo: 0.05,
                    stops: [20, 100],
                    colorStops: [
                      {
                        offset: 0,
                        color: primaryColor,
                        opacity: 0.4
                      },
                      {
                        offset: 100,
                        color: primaryColor,
                        opacity: 0.01
                      }
                    ]
                  }
                },
                dataLabels: {
                  enabled: false
                },
                markers: {
                  size: 0,
                  colors: [primaryColor],
                  strokeColors: '#fff',
                  strokeWidth: 3,
                  hover: { size: 7 }
                },
                grid: {
                  borderColor: '#f1f5f9',
                  strokeDashArray: 4,
                  xaxis: { lines: { show: false } },
                  yaxis: { lines: { show: true } },
                  padding: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 10
                  }
                },
                xaxis: {
                  categories: analyticsData[activeTimeframe].categories,
                  axisBorder: { show: false },
                  axisTicks: { show: false },
                  labels: {
                    style: {
                      colors: '#94a3b8',
                      fontSize: '12px',
                      fontWeight: 600
                    }
                  }
                },
                yaxis: {
                  labels: {
                    formatter: (val) => formatCompact(val),
                    style: {
                      colors: '#94a3b8',
                      fontSize: '12px',
                      fontWeight: 500
                    }
                  }
                },
                tooltip: {
                  custom: function ({ series, seriesIndex, dataPointIndex, w }) {
                    return '<div class="px-3 py-2 bg-emerald-600 text-white rounded-lg shadow-lg font-bold text-xs">' +
                      '$' + series[seriesIndex][dataPointIndex].toLocaleString() +
                      '</div>';
                  },
                  fixed: {
                    enabled: false,
                    position: 'topRight',
                  }
                }
              }}
              series={[{
                name: 'Orders',
                data: analyticsData[activeTimeframe].series
              }]}
              type="area"
              height="100%"
            />
          </div>
        </div>
      </div>
      {/* ____________________________________________________________________________________________ */}



      {/* Products and Recent Orders Table Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Top selling Product Section */}
        <div className="xl:col-span-2 ">
          <div className="bg-white p-4 rounded-md border border-slate-100 h-full">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold">Recent Orders</h3>
            </div>
            <DataTable
              columns={columns}
              data={allorders || []}
              onView={handleView}
              itemsPerPage={6}
              hidePagination={true}
              hideSearch={true}
            />
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white p-4 rounded-md border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Top Selling Products</h3>
            {/* <button className="text-xs font-semibold text-slate-400 hover:text-emerald-500 transition-colors">See all</button> */}
          </div>
          <div className="space-y-7">
            {topSellingProducts.length > 0 ? topSellingProducts.map((p, i) => (
              <RecentOrderRow
                key={i}
                name={p.name}
                price={`$${p.revenue.toFixed(2)}`}
                img={
                  p.img !== '🛒'
                    ? <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                    : '🛒'
                }
              />
            )) : (
              <p className="text-sm text-slate-500">No products sold yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// UI Components
const MetricCard = ({ title, value, percentage = 0, color }) => {
  const radius = 36;
  const strokeWidth = 9;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const displayValue = value >= 1000000 ? (value / 1000000).toFixed(1).replace(/\.0$/, '') + 'M' : value >= 10000 ? (value / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : value;

  return (
    <div className="p-4 xl:p-4 lg:p-4 md:p-4 sm:p-4 bg-white rounded-2xl shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-slate-50 flex items-center justify-between transition-all duration-300 hover:shadow-[0_8px_25px_rgba(0,0,0,0.08)]">
      <div className="flex flex-col gap-1">
        <p className="text-[13px] font-semibold text-slate-400 font-sans tracking-wide capitalize">{title}</p>
        <div className="relative group inline-block">
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight cursor-default">
            {displayValue}
          </h2>

          {/* Custom Tooltip */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200">
            <div className="bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
              Total: {value}
            </div>

            {/* Arrow */}
            <div className="w-2 h-2 bg-slate-900 rotate-45 absolute left-1/2 -translate-x-1/2 top-full -mt-1"></div>
          </div>
        </div>
      </div>
      <div className="relative flex items-center justify-center">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
          <circle
            stroke={color + '20'}
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke={color}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.8s ease-in-out' }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
      </div>
    </div>
  );
};

const ActivityLegend = ({ dotColor, label }) => (
  <div className="flex items-center gap-2">
    <div className={`w-2 h-2 rounded-full ${dotColor}`}></div>
    <span className="text-xs text-slate-500 font-medium">{label}</span>
  </div>
);



const RecentOrderRow = ({ name, price, img }) => (
  <div className="flex items-center justify-between group ">
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl group-hover:bg-white group-hover:shadow-sm transition-all overflow-hidden">{img}</div>
      <span className="font-bold text-sm line-clamp-1 max-w-[120px]">{name}</span>
    </div>
    <span className="text-sm font-bold text-primary">{price}</span>
  </div>
);

const CustomSelect = ({ options, defaultValue, onChange }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selected, setSelected] = React.useState(defaultValue);
  const dropdownRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold bg-white hover:border-[var(--primary)] transition-all duration-300 group min-w-[120px]"
      >
        <Calendar className={`w-4 h-4 transition-colors duration-300 ${isOpen ? 'text-[var(--primary)]' : 'text-slate-400 group-hover:text-[var(--primary)]'}`} />
        <span className="text-slate-700">{selected}</span>
        <ChevronDown className={`w-4 h-4 ml-auto text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[var(--primary)]' : 'group-hover:text-[var(--primary)]'}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-300 border-t-0 ring-1 ring-black/5">
          {options.map((option) => (
            <div
              key={option}
              onClick={() => {
                setSelected(option);
                setIsOpen(false);
                if (onChange) onChange(option);
              }}
              className={`px-4 py-2.5 text-sm cursor-pointer transition-all duration-200 flex items-center justify-between
                ${selected === option
                  ? 'bg-[var(--primary)] text-white font-bold'
                  : 'text-slate-600 hover:bg-slate-50 hover:pl-5'}`}
            >
              {option}
              {selected === option && <CheckCircle2 className="w-4 h-4" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;



