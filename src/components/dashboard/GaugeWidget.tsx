import React from 'react';

interface GaugeWidgetProps {
    title: string;
    percentage: number;
    subtext?: string;
}

const GaugeWidget: React.FC<GaugeWidgetProps> = ({ title, percentage, subtext }) => {
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    // We only want a semi-circle (half of the circumference)
    const strokeDashoffset = (circumference / 2) * (1 - percentage / 100);

    return (
        <div className="card" style={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '1rem' }}>{title}</h4>
            <div style={{ position: 'relative', height: '140px', width: '100%', display: 'flex', justifyContent: 'center', overflow: 'hidden', paddingTop: '15px' }}>
                <svg viewBox="0 0 160 100" width="160" height="100" style={{ transform: 'rotate(180deg)' }}>
                    <circle
                        cx="80"
                        cy="15"
                        r="70"
                        fill="transparent"
                        stroke="rgba(226, 232, 240, 0.1)"
                        strokeWidth="15"
                        strokeDasharray={(Math.PI * 140) / 2}
                        strokeLinecap="round"
                    />
                    <circle
                        cx="80"
                        cy="15"
                        r="70"
                        fill="transparent"
                        stroke="var(--primary)"
                        strokeWidth="15"
                        strokeDasharray={(Math.PI * 140) / 2}
                        strokeDashoffset={((Math.PI * 140) / 2) * (1 - percentage / 100)}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 1s ease-in-out', filter: 'drop-shadow(0 0 8px var(--primary-glow))' }}
                    />
                </svg>
                <div style={{ position: 'absolute', bottom: '20px', width: '100%', fontSize: '2rem', fontWeight: 900, color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                    {percentage}%
                </div>
            </div>
            {subtext && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{subtext}</div>}
        </div>
    );
};

export default GaugeWidget;
