import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';
import rawData from '../public/ecosystem_data/zk_ecosystems_monthly_benchmark_data.json';

// Filter data based on date range
const startDate = new Date("2022-06-06");
const endDate = new Date(); // represents today's date

const data = rawData.filter(entry => {
    const entryDate = new Date(entry.name);
    return entryDate >= startDate && entryDate <= endDate;
});

// CSS styles for the "hovering" card effect
const CardStyle = {
    padding: '20px',
    border: '1px solid #1C1C1C',
    backgroundColor: '#1C1C1C',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    borderRadius: '10px',
    margin: '20px 0'
};

// Custom Tooltip component for bar chart
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '10px', border: '1px solid #cccccc' }}>
          <p>{`Month: ${label}`}</p>
          <p>{`Sector Change: ${payload[0].value}%`}</p>
          <p>{`Mina Change: ${payload[1].value}%`}</p>
        </div>
      );
    }
    return null;
};

function BenchmarkBarChart() {
  return (
    <div style={CardStyle}>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart width={750} height={400} data={data} margin={{ top: 20, right: 40, left: 100, bottom: 50 }}>
          <XAxis dataKey="name" axisLine={false} height={50}>
            <Label value="Month Starting" position="insideBottomLeft" offset={-5} />
          </XAxis>
          <YAxis axisLine={false} width={80} domain={[-100, 100]}>
            <Label value="Percentage Change" angle={-90} position="center" offset={20} />
          </YAxis>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="sectorPercentageChange" fill="#8884d8" />
          <Bar dataKey="minaPercentageChange" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default BenchmarkBarChart;
