'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { SeverityLevel } from '@/types/cve';
import { SEVERITY_CHART_COLORS } from '@/lib/severity';

interface ChartSeverityBreakdownProps {
    data: Record<SeverityLevel, number>;
}

export default function ChartSeverityBreakdown({ data }: ChartSeverityBreakdownProps) {
    const chartData = Object.entries(data)
        .filter(([, count]) => count > 0)
        .map(([severity, count]) => ({
            name: severity,
            value: count,
            color: SEVERITY_CHART_COLORS[severity as SeverityLevel],
        }));

    if (chartData.length === 0) {
        return (
            <div className="flex h-64 items-center justify-center rounded-xl border border-white/[0.04] bg-[#0c0c10] text-sm text-slate-500">
                No data to display. Track some CVEs to see the breakdown.
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-white/[0.04] bg-[#0c0c10] p-4 shadow-lg hover:border-white/[0.08] transition-colors">
            <h3 className="mb-4 text-xs font-medium uppercase tracking-wider text-slate-400">
                Severity Breakdown
            </h3>
            <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#0f172a',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: '#e2e8f0',
                            fontSize: '13px',
                        }}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        formatter={(value: any, name: any) => [`${value} CVE${Number(value) > 1 ? 's' : ''}`, name]}
                    />
                    <Legend
                        verticalAlign="bottom"
                        iconType="circle"
                        formatter={(value: string) => (
                            <span className="text-xs text-slate-300">{value}</span>
                        )}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
