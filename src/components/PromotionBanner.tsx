import React, { useState, useEffect } from 'react';
import type { Promotion } from '../types';
import { dataService } from '../services/DataService';
import './PromotionBanner.css';

const PromotionBanner: React.FC = () => {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const fetchPromotions = async () => {
            const allPromotions = await dataService.getPromotions();
            const activePromotions = allPromotions.filter(p => {
                if (!p.active) return false;
                if (p.validUntil && new Date(p.validUntil) < new Date()) return false;
                return true;
            });
            setPromotions(activePromotions);
        };

        fetchPromotions();
        const interval = setInterval(fetchPromotions, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (promotions.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % promotions.length);
        }, 5000); // Rotate every 5 seconds

        return () => clearInterval(timer);
    }, [promotions]);

    if (promotions.length === 0) return null;

    return (
        <div className="promotion-banner">
            <div className="promotion-content" key={promotions[currentIndex].id}>
                <div className="promotion-badge">PROMO</div>
                <div className="promotion-text">
                    <span className="promotion-title">{promotions[currentIndex].title}:</span>
                    <span className="promotion-description">{promotions[currentIndex].description}</span>
                </div>
                {promotions[currentIndex].validUntil && (
                    <div className="promotion-expiry">
                        Expires: {new Date(promotions[currentIndex].validUntil!).toLocaleDateString()}
                    </div>
                )}
            </div>
            {promotions.length > 1 && (
                <div className="promotion-indicators">
                    {promotions.map((_, index) => (
                        <div
                            key={index}
                            className={`indicator ${index === currentIndex ? 'active' : ''}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default PromotionBanner;
