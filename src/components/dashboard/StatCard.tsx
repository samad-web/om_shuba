import React from 'react';

interface StatCardProps {
    title: string;
    value: string;
    trend: string;
    trendType: 'up' | 'down' | 'neutral' | 'info';
    trendLabel?: string;
    sparklineData: number[];
    onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, trend, trendType, trendLabel, sparklineData, onClick }) => {
    return (
        <div
            className="card animate-fade-in stat-card-premium"
            onClick={onClick}
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: 'var(--space-6)',
                cursor: onClick ? 'pointer' : 'default',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                border: '1px solid var(--border)',
                background: 'var(--bg-card)'
            }}
        >
            <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, marginBottom: 'var(--space-1)' }}>
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
                    color: trendType === 'up' ? 'var(--success)' : trendType === 'down' ? 'var(--danger)' : trendType === 'info' ? 'var(--primary)' : 'var(--text-muted)',
                    fontWeight: 700,
                    backgroundColor: trendType === 'up' ? 'rgba(16, 185, 129, 0.1)' : trendType === 'down' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    transition: 'all 0.3s ease'
                }}>
                    <span style={{ fontSize: '1rem', lineHeight: 1 }}>{trendType === 'up' ? '↗' : trendType === 'down' ? '↘' : '•'}</span>
                    {trend}
                    {trendLabel && <span style={{ color: 'var(--text-muted)', fontWeight: 500, marginLeft: '2px' }}>{trendLabel}</span>}
                </div>
            </div>

            <div
                key={JSON.stringify(sparklineData)} // Force re-animation on data change
                style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '48px', alignSelf: 'center', position: 'relative', zIndex: 2 }}
            >
                {sparklineData.map((val, i) => (
                    <div
                        key={i}
                        style={{
                            width: '4px',
                            height: `${Math.max(15, val)}%`,
                            background: trendType === 'up' ? 'var(--primary)' : trendType === 'down' ? 'var(--danger)' : 'var(--primary)',
                            borderRadius: '2px',
                            opacity: 0.3 + (i / sparklineData.length) * 0.7,
                            transition: 'height 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                            animation: `premiumGrowUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`,
                            animationDelay: `${i * 0.05}s`
                        }}
                    />
                ))}
            </div>

            {/* Subtle glow effect background */}
            <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '100px',
                height: '100px',
                background: trendType === 'up' ? 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)',
                zIndex: 1
            }} />

            <style>
                {`
                @keyframes premiumGrowUp {
                    from { height: 0; opacity: 0; transform: translateY(10px); }
                    to { opacity: inherit; transform: translateY(0); }
                }
                .stat-card-premium {
                    transform: translateZ(0); /* Hardware acceleration */
                }
                .stat-card-premium:hover {
                    transform: translateY(-6px) scale(1.02);
                    box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.3);
                    border-color: var(--primary) !important;
                    background: linear-gradient(to bottom right, var(--bg-card), rgba(var(--primary-rgb), 0.02)) !important;
                }
                .stat-card-premium:active {
                    transform: translateY(-2px) scale(1.01);
                }
                `}
            </style>
        </div>
    );
};

export default StatCard;
