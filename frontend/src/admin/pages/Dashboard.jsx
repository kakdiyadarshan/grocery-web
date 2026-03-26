import React, { useEffect, useState } from 'react';
import {
  ShoppingCart,
  XCircle,
  CheckCircle2,
  Clock,
  MoreVertical,
  Search,
  Calendar,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  ArrowUpDown,
  Trash2,
  Mail
} from 'lucide-react';
import DataTable from '../component/DataTable';
import {
  PieChart, Pie, Sector, ResponsiveContainer, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList
} from 'recharts';
import ReactApexChart from 'react-apexcharts';




const COLORS = ['#228B22', '#b3d498', '#98d4a0',"#70bb70"];
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

  return (
    <g>
      <text x={cx} y={cy} dy={-10} textAnchor="middle" fill={fill} className="text-[14px] font-bold uppercase tracking-wider">
        {payload.name}
      </text>
      <text x={cx} y={cy} dy={12} textAnchor="middle" fill="#1e293b" className="text-[18px] font-extrabold">
        {`${value}%`}
      </text>
      <text x={cx} y={cy} dy={28} textAnchor="middle" fill="#64748b" className="text-[11px] font-semibold">
        {`(${(percent * 100).toFixed(1)}%)`}
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

  const [primaryColor, setPrimaryColor] = useState('');

  useEffect(() => {
    const color = getComputedStyle(document.documentElement)
      .getPropertyValue('--primary')
      .trim();
    setPrimaryColor(color);
  }, []);

  const barData = [
    { name: 'Jan', orders: 150 },
    { name: 'Feb', orders: 280 },
    { name: 'Mar', orders: 400 },
    { name: 'Apr', orders: 310 },
    { name: 'May', orders: 270 },
    { name: 'Jun', orders: 420 },
    { name: 'Jul', orders: 380 },
    { name: 'Aug', orders: 310 },
    { name: 'Sep', orders: 250 },
    { name: 'Oct', orders: 320 },
    { name: 'Nov', orders: 260 },
    { name: 'Dec', orders: 380 },
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

  const pieData = [
    { name: 'Active', value: 70 },
    { name: 'Inactive', value: 15 },
    { name: 'New Add', value: 15 },
  ];

  const [activeTimeframe, setActiveTimeframe] = useState('Weekly');
  const analyticsData = {
    Weekly: {
      categories: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
      series: [4350, 4480, 4420, 4680, 4510, 4390, 4460]
    },
    Monthly: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      series: [2500, 3100, 4000, 3500, 2900, 4200, 3800, 3100, 2500, 3200, 2600, 3800]
    },
    Yearly: {
      categories: ['2021', '2022', '2023', '2024', '2025'],
      series: [45000, 52000, 48000, 61000, 58000]
    }
  };

  const columns = [
    { header: '#', accessor: 'id' },
    {
      header: 'Product Name',
      accessor: 'name',
      render: (item) => (
        <div className="flex items-center gap-3 font-jost">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
            <Mail className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="font-semibold text-[14px] text-slate-700">{item.name}</span>
        </div>
      )
    },
    { header: 'Joined Date', accessor: 'date' },
    { header: 'Status', accessor: 'status' },
  ];

  const tableData = [
    { id: "1", name: "Strawberry", date: "25 Mar 2026, 12:19 pm", status: "Active" },
    { id: "2", name: "Wheat flour", date: "25 Mar 2026, 01:45 pm", status: "Active" },
    { id: "3", name: "Energy drinks", date: "26 Mar 2026, 09:30 am", status: "Rejected" },
    { id: "4", name: "Fresh Milk", date: "27 Mar 2026, 11:20 am", status: "Active" },
  ];

  return (
    <div className="py-8 w-full min-h-screen text-slate-800">
      {/* Top Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Orders"
          value="6,327"
          percentage="+1.7%"
          isPositive={true}
          icon={<ShoppingCart className="text-[var(--primary)]" />}
          bgColor="bg-emerald-50"
          borderColor="border-[var(--primary)]"
        />
        <MetricCard
          title="Order Cancelled"
          value="1,025"
          percentage="-2.6%"
          isPositive={false}
          icon={<XCircle className="text-[var(--primary)]" />}
          bgColor="bg-emerald-50"
          borderColor="border-[var(--primary)]"
        />
        <MetricCard
          title="Order Completed"
          value="4,280"
          percentage="+4.9%"
          isPositive={true}
          icon={<CheckCircle2 className="text-[var(--primary)]" />}
          bgColor="bg-emerald-50"
          borderColor="border-[var(--primary)]"
        />
        <MetricCard
          title="Order Pending"
          value="940"
          percentage="-2.6%"
          isPositive={false}
          icon={<Clock className="text-[var(--primary)]" />}
          bgColor="bg-emerald-50"
          borderColor="border-[var(--primary)]"
        />
      </div>


      {/* ____________________________________________________________________________________________ */}

      {/* Analytics and Activity Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Orders Analytics */}
        <div className="lg:col-span-2 rounded-md bg-white p-4 border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold">Orders Analytics</h3>
            <div className="flex items-center gap-6">
              <CustomSelect
                options={['2025', '2024', '2023']}
                defaultValue="2025"
                onChange={(year) => console.log('Selected year:', year)}
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

        {/* Employees Activity */}
        <div className="bg-white rounded-md p-6 border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold">Product Analytics</h3>
            {/* <button className="p-1 hover:bg-slate-50 rounded-lg">
              <MoreVertical className="w-5 h-5 text-slate-400" />
            </button> */}
          </div>
          <div className="flex flex-col items-center">
            <div className="relative w-full h-80 mb-4 flex justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <Pie
                    activeIndex={activeIndex}
                    activeShape={(props) => renderActiveShape({ ...props, isMobile: isMobileSize })}
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                    onMouseEnter={onPieEnter}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={() => null} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-4 w-full">
              <ActivityLegend dotColor="bg-[var(--primary)]" label="Active" />
              <ActivityLegend dotColor="bg-orange-500" label="Inactive" />
              <ActivityLegend dotColor="bg-yellow-400" label="New Add" />
            </div>
          </div>
        </div>
      </div>


      {/* ____________________________________________________________________________________________ */}

      {/* Product Chart*/}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
       

        <div className="bg-white rounded-md p-4 border border-slate-100 lg:col-span-1">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold">Category Distribution</h3>
            {/* <button className="p-1 hover:bg-slate-50 rounded-lg">
              <MoreVertical className="w-5 h-5 text-slate-400" />
            </button> */}
          </div>
          <div className="w-full">
            <ReactApexChart
              options={{
                chart: {
                  type: 'bar',
                  height: 350,
                  dropShadow: {
                    enabled: true,
                  },
                  toolbar: {
                    show: false
                  }
                },
                plotOptions: {
                  bar: {
                    borderRadius: 4,
                    horizontal: true,
                    distributed: true,
                    barHeight: '70%',
                    isFunnel: false,
                  },
                },
                colors: [
                  primaryColor+'65',
                  primaryColor+'70',
                  primaryColor+'75',
                  primaryColor+'80',
                  primaryColor+'85',
                  primaryColor+'90',
                  primaryColor+'95',
                  primaryColor,
                ],
                dataLabels: {
                  enabled: false,
                },
                xaxis: {
                  categories: ['Sweets', 'Processed Foods', 'Healthy Fats', 'Meat', 'Beans & Legumes', 'Dairy', 'Fruits & Vegetables', 'Grains'],
                  axisBorder: { show: false },
                  axisTicks: { show: false },
                  labels: { show: false }
                },
                yaxis: {
                  labels: {
                    style: {
                      fontSize: '13px',
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
                    left: 0,
                    right: 20
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
                  name: "Category Count",
                  data: [200, 330, 548, 740, 880, 990, 1100, 1380],
                },
              ]}
              type="bar"
              height={350}
            />
          </div>
        </div>

        {/* Orders Analytics */}
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
              {activeTimeframe === 'Weekly' ? '$18,200.82' : activeTimeframe === 'Monthly' ? '$45,300.00' : '$264,000.00'}
            </h2>
            <div className="flex items-center px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold gap-1 border border-emerald-100">
               <ArrowUpRight className="w-3 h-3" />
               {activeTimeframe === 'Weekly' ? '8.24%' : activeTimeframe === 'Monthly' ? '12.5%' : '15.8%'}
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
                    left: 0
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
                    formatter: (val) => `$${val.toLocaleString()}`,
                    style: {
                      colors: '#94a3b8',
                      fontSize: '12px',
                      fontWeight: 500
                    }
                  }
                },
                tooltip: {
                  custom: function({ series, seriesIndex, dataPointIndex, w }) {
                    return '<div className="px-3 py-2 bg-emerald-600 text-white rounded-lg shadow-lg font-bold text-xs">' +
                      '$' + series[seriesIndex][dataPointIndex].toLocaleString() +
                      '</div>'
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
              <h3 className="text-xl font-bold">Top Selling Products</h3>
            </div>
            <DataTable
              columns={columns}
              data={tableData}
              onDelete={(item) => console.log('Delete:', item)}
              itemsPerPage={5}
            />
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white p-4 rounded-md border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Recent Orders</h3>
            {/* <button className="text-xs font-semibold text-slate-400 hover:text-emerald-500 transition-colors">See all</button> */}
          </div>
          <div className="space-y-6">
            <RecentOrderRow name="Grocery's" price="$500" img="🛒" />
            <RecentOrderRow name="Vegetables" price="$250" img="🥦" />
            <RecentOrderRow name="Kurkure Masala" price="$150" img="🍟" />
            <RecentOrderRow name="Banana" price="$100" img="🍌" />
            <RecentOrderRow name="Green Apple" price="$300" img="🍏" />
            <RecentOrderRow name="Tomato sos" price="$350" img="🥫" />
          </div>
        </div>
      </div>
    </div>
  );
};

// UI Components
const MetricCard = ({ title, value, percentage, isPositive, icon, bgColor, borderColor }) => (
  <div
    className={`p-6 bg-white  border ${borderColor}  
      relative overflow-hidden group 
      rounded-md 
      transition-all duration-300 ease-out cursor-pointer`}
  >
    {/* Soft gradient glow on hover */}
    <div
      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none"
      style={{
        background:
          "radial-gradient(circle at top right, rgba(0,0,0,0.04), transparent 60%)",
      }}
    />

    {/* Top */}
    <div className="flex justify-between items-start mb-5 relative z-10">
      <div>
        <p className="text-sm text-slate-400 mb-1">{title}</p>
        <h2 className="text-2xl font-bold text-slate-800">{value}</h2>
      </div>

      {/* Icon */}
      <div
        className={`p-3 rounded-2xl ${bgColor} 
          group-hover:scale-105 transition duration-300`}
      >
        {icon}
      </div>
    </div>

    {/* Bottom */}
    <div className="flex items-center gap-2 relative z-10">
      <div
        className={`flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold
          ${isPositive
            ? "bg-emerald-100 text-emerald-600"
            : "bg-red-100 text-red-600"
          }`}
      >
        {isPositive ? (
          <ArrowUpRight className="w-3 h-3 mr-0.5" />
        ) : (
          <ArrowDownRight className="w-3 h-3 mr-0.5" />
        )}
        {percentage}
      </div>

      <span className="text-xs text-slate-400">
        From last month
      </span>
    </div>
  </div>
);

const ActivityLegend = ({ dotColor, label }) => (
  <div className="flex items-center gap-2">
    <div className={`w-2 h-2 rounded-full ${dotColor}`}></div>
    <span className="text-xs text-slate-500 font-medium">{label}</span>
  </div>
);



const RecentOrderRow = ({ name, price, img }) => (
  <div className="flex items-center justify-between group cursor-pointer">
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl group-hover:bg-white group-hover:shadow-sm transition-all">{img}</div>
      <span className="font-bold text-sm">{name}</span>
    </div>
    <span className="text-sm font-bold text-emerald-500">{price}</span>
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
