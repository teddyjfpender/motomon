import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { scaleSequential, scaleLog } from 'd3-scale';
import { interpolateOranges } from 'd3-scale-chromatic';
import data from '../public/ecosystem_data/pie-charts/ecosystem_processed_owner_last_month_data.json';

// Custom Tooltip component
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0)', padding: '10px', border: '1px solid #fff' }}>
          <p>{`Owner: ${label}`}</p>   
          <p>{`Commits: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
};

function EcosystemCommitsByOwnerLastMonthDonutChart() {
    // Transform data to an array format suitable for the PieChart and filter out zero values
    const pieData = Object.entries(data)
        .sort((a, b) => b[1] - a[1])
        .map(([name, value]) => ({ name, value }))
        .filter(item => item.value !== 0);

    const maxLogValue = Math.log(Math.max(...pieData.map(d => d.value + 1)));

    const logScale = scaleLog().domain([1, Math.exp(maxLogValue)]).range([0, 1]);
    const colorScale = scaleSequential(interpolateOranges);
    const topLegendItems = pieData.slice(0, 5).map(item => ({ value: item.name, type: 'square', color: colorScale(logScale(item.value + 1)) }));

    return (
      <ResponsiveContainer width="100%" height={400}>
        <PieChart width={800} height={400}>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={150}
            fill="#8884d8"
            dataKey="value"
          >
            {
              pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={colorScale(logScale(entry.value + 1))} />)
            }
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend payload={topLegendItems} wrapperStyle={{ color: '#ffffff' }} />
        </PieChart>
      </ResponsiveContainer>
    );
}

export default EcosystemCommitsByOwnerLastMonthDonutChart;
