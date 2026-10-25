import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export const BudgetChart = ({ breakdown, currency = '$' }) => {
  if (!breakdown) return null;

  const data = [
    { name: 'Accommodation', value: Number(breakdown.accommodation || 0), color: '#0d9488' },
    { name: 'Food & Dining', value: Number(breakdown.food || 0), color: '#f59e0b' },
    { name: 'Activities & Sights', value: Number(breakdown.activities || 0), color: '#0284c7' },
    { name: 'Transportation', value: Number(breakdown.transportation || 0), color: '#8b5cf6' },
    { name: 'Other & Contingencies', value: Number(breakdown.other || 0), color: '#64748b' },
  ].filter((item) => item.value > 0);

  if (data.length === 0) return null;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const p = payload[0];
      return (
        <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg">
          <p className="font-semibold">{p.name}</p>
          <p className="text-teal-300 font-bold">{currency} {p.value.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
