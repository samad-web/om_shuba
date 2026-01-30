import React from 'react';
import type { PipelineStage } from '../../types';

interface PipelineTrackerProps {
    currentStage: PipelineStage;
    className?: string;
}

const steps = [
    {
        id: 'enquiry',
        label: 'Enquiry',
        stages: ['New']
    },
    {
        id: 'qualified',
        label: 'Qualified',
        stages: ['Qualified', 'Forwarded', 'Contacted']
    },
    {
        id: 'interaction',
        label: 'Interaction',
        stages: ['Demo Scheduled', 'Visit Scheduled', 'Demo/Visit Done']
    },
    {
        id: 'fulfillment',
        label: 'Fulfillment',
        stages: ['Delivery Scheduled', 'Delivered']
    },
    {
        id: 'closure',
        label: 'Closed',
        stages: ['Closed-Converted', 'Closed-Not Interested']
    }
];

const PipelineTracker: React.FC<PipelineTrackerProps> = ({ currentStage, className = '' }) => {

    const getCurrentStepIndex = () => {
        // Special case: if closed-not interested, maybe show red?
        // For linear progress, we find which step contains the current stage.
        const index = steps.findIndex(step => step.stages.includes(currentStage));

        // If "Closed-Not Interested", we might want to visually show it as the last step but maybe red.
        // For now, let's just treat it as the last step.
        return index !== -1 ? index : 0;
    };

    const currentStepIndex = getCurrentStepIndex();
    const isLost = currentStage === 'Closed-Not Interested';

    return (
        <div className={`w-full ${className}`} style={{ padding: '2rem 0' }}>
            {/* Desktop Stepper */}
            <div className="hidden-mobile" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                <div style={{
                    position: 'absolute', top: '16px', left: '0', right: '0', height: '2px',
                    background: 'var(--border)', zIndex: 0
                }} />

                <div style={{
                    position: 'absolute', top: '16px', left: '0',
                    width: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
                    height: '2px',
                    background: isLost ? 'var(--danger)' : 'var(--primary)',
                    zIndex: 0,
                    transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                }} />

                {steps.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;

                    return (
                        <div key={step.id} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '50%',
                                background: isCurrent
                                    ? (isLost ? 'var(--danger)' : 'var(--primary)')
                                    : (isCompleted ? (isLost ? 'var(--danger)' : 'var(--primary)') : 'var(--bg-card)'),
                                border: `2px solid ${isCurrent || isCompleted ? (isLost ? 'var(--danger)' : 'var(--primary)') : 'var(--border)'}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: isCompleted || isCurrent ? 'white' : 'var(--text-muted)',
                                fontWeight: '700',
                                fontSize: '0.75rem',
                                transition: 'all 0.4s ease',
                                boxShadow: isCurrent ? `0 0 0 4px ${isLost ? 'rgba(239, 68, 68, 0.2)' : 'var(--primary-glow)'}` : 'none'
                            }}>
                                {isCompleted && !isCurrent ? '✓' : index + 1}
                            </div>
                            <div style={{
                                marginTop: 'var(--space-3)',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                textAlign: 'center',
                                color: isCurrent ? (isLost ? 'var(--danger)' : 'var(--primary)') : 'var(--text-muted)',
                                transition: 'color 0.4s ease'
                            }}>
                                {step.label}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Mobile Vertical Stepper */}
            <div className="visible-mobile" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {steps.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;

                    return (
                        <div key={step.id} style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{
                                    width: '28px', height: '28px', borderRadius: '50%',
                                    background: isCurrent
                                        ? (isLost ? 'var(--danger)' : 'var(--primary)')
                                        : (isCompleted ? (isLost ? 'var(--danger)' : 'var(--primary)') : 'var(--bg-card)'),
                                    border: `2px solid ${isCurrent || isCompleted ? (isLost ? 'var(--danger)' : 'var(--primary)') : 'var(--border)'}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: isCompleted || isCurrent ? 'white' : 'var(--text-muted)',
                                    fontWeight: '700',
                                    fontSize: '0.7rem',
                                    zIndex: 1
                                }}>
                                    {isCompleted && !isCurrent ? '✓' : index + 1}
                                </div>
                                {index < steps.length - 1 && (
                                    <div style={{
                                        width: '2px', height: '24px',
                                        background: index < currentStepIndex ? (isLost ? 'var(--danger)' : 'var(--primary)') : 'var(--border)',
                                        margin: '4px 0'
                                    }} />
                                )}
                            </div>
                            <div style={{ paddingTop: '2px' }}>
                                <div style={{
                                    fontSize: '0.875rem',
                                    fontWeight: 700,
                                    color: isCurrent ? (isLost ? 'var(--danger)' : 'var(--primary)') : 'var(--text-main)'
                                }}>
                                    {step.label}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    {isCurrent ? currentStage : step.stages[0]}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <style>
                {`
                @media (min-width: 769px) {
                    .visible-mobile { display: none !important; }
                }
                @media (max-width: 768px) {
                    .hidden-mobile { display: none !important; }
                }
                `}
            </style>
        </div>
    );
};

export default PipelineTracker;
