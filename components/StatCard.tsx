import React from 'react';

interface StatCardProps {
    label: string;
    value: string | number;
    icon?: React.ReactNode;
    color?: string;
    subtitle?: string;
}

export default function StatCard({ label, value, icon, color = 'text-cyan-400', subtitle }: StatCardProps) {
    return (
        <div className="group relative overflow-hidden rounded-xl border border-white/[0.04] bg-[#0c0c10] p-5 shadow-lg transition-all duration-300 hover:border-white/[0.08] hover:bg-[#111116]">
            <div className="flex flex-col justify-between h-full">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        {icon && (
                            <div className={`flex h-6 w-6 items-center justify-center rounded bg-white/[0.03] ${color}`}>
                                <div className="scale-75">{icon}</div>
                            </div>
                        )}
                        <p className="text-xs font-medium text-slate-400">{label}</p>
                    </div>
                </div>

                <div className="mt-1">
                    <div className="flex items-end gap-3">
                        <p className="text-3xl font-semibold tracking-tight text-white">{value}</p>
                        {subtitle && (
                            <p className={`mb-1 text-xs font-medium ${color}`}>{subtitle}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Subtle indicator line left */}
            <div className={`absolute bottom-0 left-0 top-0 w-[2px] opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${color.replace('text-', 'bg-')}`} />
        </div>
    );
}
