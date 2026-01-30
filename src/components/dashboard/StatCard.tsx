import React from 'react';

interface StatCardProps {
    title: string;
    value: string;
    trend: string;
    trendType: 'up' | 'down';
    sparklineData: number[];
    onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, trend, trendType, sparklineData, onClick }) => {
    return (
        <div
            className={`card animate-fade-in ${onClick ? 'clickable-card' : ''}`}
            onClick={onClick}
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: 'var(--space-6)',
                cursor: onClick ? 'pointer' : 'default',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
        >
            <div>
                <div style={{ color: '#FFFFFF', fontSize: '0.875rem', fontWeight: 850, marginBottom: 'var(--space-1)', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
                    {title}
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 'var(--space-2)', letterSpacing: '-0.03em' }}>
                    {value}
                </div>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.75rem',
                    color: trendType === 'up' ? 'var(--success)' : 'var(--danger)',
                    fontWeight: 700,
                    backgroundColor: trendType === 'up' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)'
                }}>
                    <span style={{ fontSize: '1rem', lineHeight: 1 }}>{trendType === 'up' ? '↗' : '↘'}</span>
                    {trend}
                    <span style={{ color: 'var(--text-muted)', fontWeight: 500, marginLeft: '2px' }}>than last month</span>
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '48px', alignSelf: 'center' }}>
                {sparklineData.map((val, i) => (
                    <div
                        key={i}
                        style={{
                            width: '4px',
                            height: `${Math.max(20, val)}%`,
                            background: trendType === 'up' ? 'var(--primary)' : 'var(--danger)',
                            borderRadius: '2px',
                            opacity: 0.2 + (i / sparklineData.length) * 0.8,
                            transition: 'height 1s ease-out',
                            animation: `growUp ${0.5 + i * 0.1}s ease-out`
                        }}
                    />
                ))}
            </div>
            <style>
                {`
                @keyframes growUp {
                    from { height: 0; }
                    to { height: inherit; }
                }
                .clickable-card:hover {
                    transform: translateY(-4px) scale(1.02);
                    box-shadow: var(--shadow-lg);
                    border-color: var(--primary) !important;
                }
                .clickable-card:active {
                    transform: translateY(-2px) scale(1);
                }
                `}
            </style>
        </div>
    );
};

export default StatCard;
