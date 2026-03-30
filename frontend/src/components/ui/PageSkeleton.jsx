import React from 'react';
import { motion } from 'framer-motion';

/**
 * Lightweight animated skeleton placeholder for lazy-loaded pages.
 * Shows pulsing placeholder blocks to avoid blank flash during code-split chunk loading.
 */
export default function PageSkeleton() {
    const shimmer = {
        animate: {
            opacity: [0.3, 0.6, 0.3],
        },
        transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    };

    const barStyle = (width, height = '1rem', mb = '1rem') => ({
        width,
        height,
        borderRadius: '8px',
        background: 'rgba(255, 255, 255, 0.06)',
        marginBottom: mb,
    });

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
            {/* Header skeleton */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <motion.div {...shimmer} style={barStyle('200px', '2rem', '0')} />
                <motion.div {...shimmer} style={barStyle('100px', '2rem', '0')} />
            </div>

            {/* Card skeletons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {[1, 2, 3, 4].map((i) => (
                    <motion.div
                        key={i}
                        {...shimmer}
                        style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                            borderRadius: '16px',
                            padding: '1.5rem',
                            minHeight: '180px',
                        }}
                    >
                        <div style={barStyle('60%', '1rem')} />
                        <div style={barStyle('90%', '0.75rem')} />
                        <div style={barStyle('75%', '0.75rem')} />
                        <div style={barStyle('40%', '2rem', '0')} />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
