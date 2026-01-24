import React from 'react';

interface GaugeWidgetProps {
    title: string;
    percentage: number;
    subtext?: string;
}

const GaugeWidget: React.FC<GaugeWidgetProps> = ({ title, percentage, subtext }) => {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    // We only want a semi-circle (half of the circumference)
    const strokeDashoffset = circumference - (percentage / 100) * (circumference / 2);

    return (
        <div className="card" style={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h4 style={{ fontSize: '0.9rem', color: '#0f172a', marginBottom: '1rem' }}>{title}</h4>
            <div style={{ position: 'relative', height: '100px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                <svg width="120" height="70" style={{ transform: 'rotate(180deg)' }}>
                    <circle
                        cx="60"
                        cy="10"
                        r={radius}
                        fill="transparent"
                        stroke="#e2e8f0"
                        strokeWidth="10"
                        strokeDasharray={circumference / 2}
                        strokeLinecap="round"
                    />
                    <circle
                        cx="60"
                        cy="10"
                        r={radius}
                        fill="transparent"
                        stroke="var(--primary)"
                        strokeWidth="10"
                        strokeDasharray={circumference / 2}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                    />
                </svg>
                <div style={{ position: 'absolute', bottom: '10px', width: '100%', fontSize: '1.5rem', fontWeight: 800 }}>
                    {percentage}%
                </div>
            </div>
            {subtext && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{subtext}</div>}
        </div>
    );
};

export default GaugeWidget;
