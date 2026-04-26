import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface AreaChartProps {
  data: any[];
  dataKey: string;
  xKey: string;
  color?: string;
}

export function AreaChartComponent({ data, dataKey, xKey, color = '#2563eb' }: AreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`color-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.8} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => formatCurrency(v)} />
        <Tooltip
          formatter={(value: number) => [formatCurrency(value), '']}
          labelStyle={{ fontWeight: 'bold' }}
        />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          fillOpacity={1}
          fill={`url(#color-${dataKey})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}