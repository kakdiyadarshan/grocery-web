import React from 'react';
import Chart from 'react-apexcharts';

const StockChart = ({ products }) => {
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

    // Create a series for each unique variation (now sorted)
    const series = uniqueVariations.map(variation => ({
        name: variation,
        data: products.map(p => {
            const v = p.weighstWise.find(w => `${w.weight} ${w.unit}` === variation);
            return v ? v.stock : 0;
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
        responsive: [{
            breakpoint: 480,
            options: {
                legend: {
                    position: 'bottom',
                    offsetX: -10,
                    offsetY: 0
                }
            }
        }],
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
                style: {
                    fontFamily: 'Outfit, sans-serif',
                }
            }
        },
        yaxis: {
            title: {
                text: 'Stock Count',
                style: {
                    fontFamily: 'Outfit, sans-serif',
                }
            },
            labels: {
                style: {
                    fontFamily: 'Outfit, sans-serif',
                }
            }
        },
        legend: {
            position: 'top',
            fontFamily: 'Outfit, sans-serif',
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
        colors: ['#4ade80', '#22c55e', '#16a34a', '#15803d', '#14532d', '#0b4121', '#052110']
    };

    return (
        <div className="bg-white p-6 rounded-[4px] shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-800 tracking-tight mb-4 flex items-center gap-2">
                <div className="w-6 h-[2px] bg-primary" /> Product Variation Stocks
            </h3>
            <div id="chart">
                <Chart options={options} series={series} type="bar" height={350} />
            </div>
        </div>
    );
};

export default StockChart;
