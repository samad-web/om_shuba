import React from 'react';

interface StatCardProps {
    title: string;
    value: string;
    trend: string;
    trendType: 'up' | 'down';
    sparklineData: number[];
}

const StatCard: React.FC<StatCardProps> = ({ title, value, trend, trendType, sparklineData }) => {
    return (
        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', padding: '1.25rem' }}>
            <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.25rem' }}>{title}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>{value}</div>
                <div style={{ fontSize: '0.75rem', color: trendType === 'up' ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                    {trendType === 'up' ? '↗' : '↘'} {trend} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>from last month</span>
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '40px', alignSelf: 'center' }}>
                {sparklineData.map((val, i) => (
                    <div
                        key={i}
                        style={{
                            width: '4px',
                            height: `${val}%`,
                            backgroundColor: 'var(--primary)',
                            borderRadius: '2px',
                            opacity: 0.1 + (i / sparklineData.length) * 0.9
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default StatCard;
