
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface UsageChartProps {
  data: Array<{ name: string; value: number }>;
  color: string;
}

const UsageChart: React.FC<UsageChartProps> = ({ data, color }) => {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="name" 
            tick={{ fill: 'rgba(255,255,255,0.6)' }}
            axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
          />
          <YAxis 
            tick={{ fill: 'rgba(255,255,255,0.6)' }}
            axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#0F0F14', 
              border: '1px solid rgba(255,215,0,0.3)',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
            }}
            labelStyle={{ color: color }}
            itemStyle={{ color: 'rgba(255,255,255,0.8)' }}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            fill={`${color}22`} 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UsageChart;
