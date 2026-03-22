import React from 'react';

const BarLoader = ({ message }) => {
    return (
        <div className="flex flex-col items-center gap-4 w-full justify-center">
            <div className="flex gap-2 items-center justify-center h-10">
                <div className="w-1.5 h-full bg-[var(--secondary)] rounded animate-bar-loader" style={{ animationDelay: '0s' }}></div>
                <div className="w-1.5 h-full bg-[var(--primary)] rounded animate-bar-loader" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1.5 h-full bg-[var(--secondary)] rounded animate-bar-loader" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1.5 h-full bg-[var(--primary)] rounded animate-bar-loader" style={{ animationDelay: '0.3s' }}></div>
                <div className="w-1.5 h-full bg-[var(--secondary)] rounded animate-bar-loader" style={{ animationDelay: '0.4s' }}></div>
            </div>
            {message && <div className="text-[var(--secondary)] text-sm font-medium animate-pulse">{message}</div>}
        </div>
    );
};

export default BarLoader;
