import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const LoadingContext = createContext();

export function useLoading() {
    const context = useContext(LoadingContext);
    if (!context) {
        throw new Error("useLoading must be used within a LoadingProvider");
    }
    return context;
}

export function LoadingProvider({ children }) {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const minDisplayTimeMs = 500;
    const loadStartTime = useRef(null);

    const startLoading = useCallback((message = '') => {
        setLoadingMessage(message);
        setIsLoading(true);
        loadStartTime.current = Date.now();
    }, []);

    const stopLoading = useCallback(() => {
        if (!loadStartTime.current) {
            setIsLoading(false);
            setLoadingMessage('');
            return;
        }

        const elapsed = Date.now() - loadStartTime.current;
        if (elapsed < minDisplayTimeMs) {
            setTimeout(() => {
                setIsLoading(false);
                setLoadingMessage('');
            }, minDisplayTimeMs - elapsed);
        } else {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, [minDisplayTimeMs]);

    return (
        <LoadingContext.Provider value={{ isLoading, loadingMessage, startLoading, stopLoading }}>
            {children}
        </LoadingContext.Provider>
    );
}
