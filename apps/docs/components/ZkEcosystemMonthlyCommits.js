import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import rawData from '../public/ecosystem_data/zk_ecosystems_monthly_commit_data.json';

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

function ZkEcosystemMonthlyCommits() {
    // Generate the unique ecosystems (excluding the "name" field)
    const ecosystems = data.reduce((acc, curr) => {
        Object.keys(curr).forEach(key => {
            if (key !== 'name' && acc.indexOf(key) === -1) {
                acc.push(key);
            }
        });
        return acc;
    }, []);

    return (
        <div style={CardStyle}> {/* Applying the card style here */}
            <ResponsiveContainer width="100%" height={400}>
                <LineChart
                    width={500}
                    height={300}
                    data={data}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {
                        ecosystems.map((eco) => (
                            <Line 
                                type="monotone"
                                dataKey={eco}
                                key={eco}
                                stroke={getRandomColor()}
                                dot={false}
                            />
                        ))
                    }
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

// Helper function to generate random neon colors for the lines
function getRandomColor() {
    const neonColors = [
        '#FC2947', // Neon Red
        '#FF00CC', // Neon Pink
        '#7149C6', // Neon Purple
        '#FFDEB9', // Neon Yellow
        '#FE6244', // Neon Orange
        '#00DFA2', // Neon Green
        '#0079FF', // Neon Blue
        '#A8DF8E', // Light Green
    ];
    
    const randomIndex = Math.floor(Math.random() * neonColors.length);
    return neonColors[randomIndex];
}


export default ZkEcosystemMonthlyCommits;
