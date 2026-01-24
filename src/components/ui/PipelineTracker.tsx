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
        <div className={`w-full ${className}`} style={{ padding: '1.5rem 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                {/* Progress Bar Background */}
                <div style={{
                    position: 'absolute', top: '14px', left: '0', right: '0', height: '4px',
                    background: '#e2e8f0', zIndex: 0, borderRadius: '4px'
                }} />

                {/* Active Progress Bar */}
                <div style={{
                    position: 'absolute', top: '14px', left: '0',
                    width: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
                    height: '4px',
                    background: isLost ? '#ef4444' : '#10b981',
                    zIndex: 0,
                    borderRadius: '4px',
                    transition: 'width 0.5s ease-in-out'
                }} />

                {steps.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;

                    return (
                        <div key={step.id} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '50%',
                                background: isCurrent
                                    ? (isLost ? '#ef4444' : '#10b981')
                                    : (isCompleted ? '#10b981' : '#f8fafc'),
                                border: `3px solid ${isCurrent || isCompleted ? (isLost && isCurrent ? '#fca5a5' : '#d1fae5') : '#e2e8f0'}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: isCompleted || isCurrent ? 'white' : '#94a3b8',
                                fontWeight: 'bold',
                                fontSize: '0.8rem',
                                transition: 'all 0.3s ease',
                                boxShadow: isCurrent ? '0 0 0 4px rgba(16, 185, 129, 0.2)' : 'none'
                            }}>
                                {index + 1}
                            </div>
                            <div style={{
                                marginTop: '0.5rem',
                                fontSize: '0.75rem',
                                fontWeight: isCurrent ? 600 : 500,
                                color: isCurrent ? (isLost ? '#ef4444' : '#059669') : (isCompleted ? '#334155' : '#94a3b8')
                            }}>
                                {step.label}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PipelineTracker;
