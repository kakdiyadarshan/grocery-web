import React from 'react';
import Chart from 'react-apexcharts';

const CategoryChart = ({ products, categories }) => {
    // Process data: Count products per category
    const categoryData = categories.map((cat, index) => {
        const count = products.filter(p => p.category?._id === cat._id || p.category === cat._id).length;
        return {
            x: cat.categoryName,
            y: count
        };
    });

    const series = [{
        name: 'Product Count',
        data: categoryData
    }];

    const chartColors = ['#22c55e', '#16a34a'];

    const options = {
        chart: {
            id: 'chart2',
            type: 'line',
            height: 230,
            toolbar: {
                autoSelected: 'pan',
                show: false
            },
            fontFamily: 'Outfit, sans-serif',
        },
        responsive: [
            {
                breakpoint: 1024,
                options: {
                    chart: { height: 260 }
                }
            },
            {
                breakpoint: 768,
                options: {
                    chart: { height: 230 },
                    xaxis: { labels: { style: { fontSize: '10px' } } }
                }
            },
            {
                breakpoint: 480,
                options: {
                    chart: { height: 200 },
                    xaxis: {
                        labels: {
                            rotate: -45,
                            style: { fontSize: '9px' }
                        }
                    }
                }
            }
        ],
        colors: [chartColors[0]],
        stroke: {
            width: 3,
            curve: 'smooth'
        },
        dataLabels: {
            enabled: false
        },
        markers: {
            size: 4,
            colors: [chartColors[0]],
            strokeColors: '#fff',
            strokeWidth: 2,
            hover: {
                size: 7,
            }
        },
        grid: {
            borderColor: '#f1f5f9',
            strokeDashArray: 4
        },
        xaxis: {
            type: 'category',
            labels: {
                rotate: -45,
                rotateAlways: true,
                style: {
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '11px',
                    colors: '#64748b'
                },
                formatter: function (val) {
                    if (typeof val === 'string' && val.length > 10) {
                        return val.slice(0, 8) + '...';
                    }
                    return val;
                }
            }
        },
        yaxis: {
            title: {
                text: 'Products',
                style: {
                    fontFamily: 'Outfit, sans-serif',
                    color: '#64748b',
                    fontWeight: 600
                }
            },
            labels: {
                style: {
                    fontFamily: 'Outfit, sans-serif',
                    colors: '#64748b'
                },
                formatter: function (val) {
                    if (val >= 1000000000) return (val / 1000000000).toFixed(1) + 'b';
                    if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
                    if (val >= 1000) return (val / 1000).toFixed(1) + 'k';
                    return val;
                }
            }
        },
        tooltip: {
            theme: 'light',
            style: {
                fontFamily: 'Outfit, sans-serif'
            },
            x: {
                show: true
            }
        }
    };

    const optionsLine = {
        chart: {
            id: 'chart1',
            height: 130,
            type: 'area',
            brush: {
                target: 'chart2',
                enabled: true
            },
            selection: {
                enabled: true,
                xaxis: {
                    min: undefined,
                    max: undefined
                }
            },
            fontFamily: 'Outfit, sans-serif',
        },
        responsive: [
            {
                breakpoint: 480,
                options: {
                    chart: { height: 100 }
                }
            }
        ],
        colors: [chartColors[1]],
        fill: {
            type: 'gradient',
            gradient: {
                opacityFrom: 0.91,
                opacityTo: 0.1,
            }
        },
        xaxis: {
            type: 'category',
            tooltip: {
                enabled: false
            },
            labels: {
                style: {
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '10px',
                    colors: '#64748b'
                },
                formatter: function (val) {
                    if (typeof val === 'string' && val.length > 8) {
                        return val.slice(0, 6) + '...';
                    }
                    return val;
                }
            }
        },
        yaxis: {
            tickAmount: 2,
            labels: {
                style: {
                    fontFamily: 'Outfit, sans-serif',
                    colors: '#64748b'
                }
            }
        }
    };

    const minChartWidth = Math.max(categories.length * 80, 500);

    return (
        <div className="w-full h-full overflow-x-auto custom-scrollbar overflow-y-hidden no-scrollbar">
            <div style={{ width: `${minChartWidth}px`, minWidth: '100%' }} className="space-y-4">
                <div id="wrapper" className="bg-white p-4 rounded-lg">
                    <div id="chart-line2">
                        <Chart options={options} series={series} type="line" height={230} />
                    </div>
                    <div id="chart-line">
                        <Chart options={optionsLine} series={series} type="area" height={130} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryChart;
