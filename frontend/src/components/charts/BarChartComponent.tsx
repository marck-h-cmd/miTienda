import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface BarChartProps {
  data: any[];
  dataKey: string;
  xKey: string;
  color?: string;
  horizontal?: boolean;
}

export function BarChartComponent({ data, dataKey, xKey, color = '#2563eb', horizontal = false }: BarChartProps) {
  const BarChartComponent = horizontal ? BarChart : BarChart;
  
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChartComponent
        data={data}
        layout={horizontal ? 'vertical' : 'horizontal'}
        margin={{ top: 5, right: 30, left: horizontal ? 80 : 20, bottom: horizontal ? 5 : 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        {horizontal ? (
          <>
            <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} />
            <YAxis dataKey={xKey} type="category" tick={{ fontSize: 11 }} width={80} />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} angle={-45} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={(v) => formatCurrency(v)} />
          </>
        )}
        <Tooltip
          formatter={(value: number) => [formatCurrency(value), '']}
        />
        <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
      </BarChartComponent>
    </ResponsiveContainer>
  );
}