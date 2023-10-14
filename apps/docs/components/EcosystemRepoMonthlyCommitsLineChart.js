import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Label } from 'recharts';
import data from '../public/ecosystem_data/ecosystem_processed_monthly_data.json'; 

// Custom Tooltip component
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0)', padding: '10px', border: '1px solid #ffffff' }}>
          <p>{`Week Starting: ${label}`}</p>   
          <p>{`Commits: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
};

function EcosystemRepoMonthlyCommitsLineChart() {
  // Sort data by date
  const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <LineChart width={750} height={400} data={sortedData} margin={{ top: 20, right: 40, left: 100, bottom: 50 }}>
      <XAxis dataKey="date" axisLine={false} height={50}>
        <Label value="Month Starting" position="insideBottomLeft" offset={-5} />  {/* Updated Label */}
      </XAxis>
      <YAxis axisLine={false} width={80}>
        <Label value="Commits" angle={-90} position="center" offset={20} />
      </YAxis>
      <CartesianGrid vertical={false} strokeDasharray="3 3" />
      <Tooltip content={<CustomTooltip />} />
      <Legend />
      <Line type="monotone" dataKey="commits" stroke="#fcba03" dot={false} />
    </LineChart>
  );
}

export default EcosystemRepoMonthlyCommitsLineChart;
