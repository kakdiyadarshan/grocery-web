import React from 'react';
import Chart from 'react-apexcharts';

const StockChart = ({ products, noContainer = false }) => {
    // Process data for the stacked bar chart
    // Categories = Product Names
    const categories = products.map(p => p.name);

    // Utility to convert weight to a comparable numeric value (grams) for sorting
    const getWeightInGrams = (weightStr) => {
        const [value, unit] = weightStr.split(' ');
        const num = parseFloat(value);
        const unitMap = {
            'Gram': 1,
            'Kilogram': 1000,
            'Pound': 453.59,
            'Liter': 1000,
            'Milliliter': 1,
            'Piece': 1 // Pieces treated as 1 for sorting
        };
        return num * (unitMap[unit] || 1);
    };

    // Find and sort all unique weight+unit variations across all products
    const uniqueVariations = Array.from(new Set(
        products.flatMap(p => p.weighstWise.map(w => `${w.weight} ${w.unit}`))
    )).sort((a, b) => getWeightInGrams(a) - getWeightInGrams(b));

    const chartColors = ['#4ade80', '#22c55e', '#16a34a', '#15803d', '#14532d', '#0b4121', '#052110'];

    // Create a series for each unique variation (now sorted)
    const series = uniqueVariations.map((variation, vIndex) => ({
        name: variation,
        data: products.map(p => {
            const v = p.weighstWise.find(w => `${w.weight} ${w.unit}` === variation);
            const stock = v ? v.stock : 0;
            const isLowStock = stock > 0 && stock <= 10;

            return {
                x: p.name,
                y: stock,
                fillColor: isLowStock ? '#ff7675' : chartColors[vIndex % chartColors.length]
            };
        })
    }));

    const options = {
        chart: {
            type: 'bar',
            height: 350,
            stacked: true,
            toolbar: {
                show: true
            },
            zoom: {
                enabled: true
            }
        },
        responsive: [
            {
                breakpoint: 1024,
                options: {
                    chart: {
                        height: 400
                    },
                    plotOptions: {
                        bar: {
                            columnWidth: '60%'
                        }
                    }
                }
            },
            {
                breakpoint: 768,
                options: {
                    chart: {
                        height: 350
                    },
                    xaxis: {
                        labels: {
                            style: {
                                fontSize: '10px'
                            }
                        }
                    }
                }
            },
            {
                breakpoint: 480,
                options: {
                    chart: {
                        height: 300
                    },
                    legend: {
                        position: 'bottom',
                        offsetX: -5,
                        offsetY: 0
                    },
                    xaxis: {
                        labels: {
                            rotate: -45,
                            style: {
                                fontSize: '9px'
                            }
                        }
                    }
                }
            }
        ],
        plotOptions: {
            bar: {
                horizontal: false,
                borderRadius: 5,
                columnWidth: '45%',
                dataLabels: {
                    total: {
                        enabled: true,
                        style: {
                            fontSize: '11px',
                            fontWeight: 700,
                            fontFamily: 'Outfit, sans-serif'
                        }
                    }
                }
            },
        },
        xaxis: {
            type: 'category',
            categories: categories,
            labels: {
                rotate: -45,
                rotateAlways: true,
                hideOverlappingLabels: true,
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
            },
            axisBorder: {
                show: false
            },
            axisTicks: {
                show: false
            }
        },
        yaxis: {
            title: {
                text: 'Stock',
                style: {
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 600,
                    color: '#64748b'
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
        legend: {
            position: 'top',
            fontFamily: 'Outfit, sans-serif',
            offsetY: 0,
            itemMargin: {
                horizontal: 10,
                vertical: 5
            }
        },
        fill: {
            opacity: 1
        },
        tooltip: {
            y: {
                formatter: function (val) {
                    return val + " units"
                }
            },
            style: {
                fontFamily: 'Outfit, sans-serif',
            }
        },
        // Mid-Light to Dark Green Theme (Ordered for increasing weights)
        colors: chartColors
    };

    const chartHeight = options.chart.height || 350;
    const minChartWidth = Math.max(products.length * 60, 500);

    if (noContainer) {
        return (
            <div id="chart" className="w-full h-full overflow-x-auto custom-scrollbar">
                <div style={{ width: `${minChartWidth}px`, minWidth: '100%' }}>
                    <Chart options={options} series={series} type="bar" height={chartHeight} />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-[4px] shadow-sm border border-gray-100 w-full overflow-hidden">
            <h3 className="text-sm font-bold text-gray-800 tracking-tight mb-4 flex items-center gap-2">
                <div className="w-6 h-[2px] bg-primary" /> Product Variation Stocks
            </h3>
            <div id="chart" className="w-full overflow-x-auto custom-scrollbar">
                <div style={{ width: `${minChartWidth}px`, minWidth: '100%' }}>
                    <Chart options={options} series={series} type="bar" height={chartHeight} />
                </div>
            </div>
        </div>
    );
};

export default StockChart;
