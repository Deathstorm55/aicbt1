import React, { createContext, useContext, useState, useCallback } from 'react';

const PopupContext = createContext();

export function usePopup() {
    const context = useContext(PopupContext);
    if (!context) {
        throw new Error("usePopup must be used within a PopupProvider");
    }
    return context;
}

export function PopupProvider({ children }) {
    const [popups, setPopups] = useState([]);

    const showPopup = useCallback((popup) => {
        const id = Math.random().toString(36).substring(2, 9);
        const newPopup = {
            id,
            duration: 5000, // default auto-dismiss duration
            type: 'info',  // info, success, warning, error
            ...popup
        };

        setPopups(prev => [...prev, newPopup]);

        if (newPopup.duration > 0) {
            setTimeout(() => {
                removePopup(id);
            }, newPopup.duration);
        }

        return id;
    }, []);

    const removePopup = useCallback((id) => {
        setPopups(prev => prev.filter(p => p.id !== id));
    }, []);

    return (
        <PopupContext.Provider value={{ popups, showPopup, removePopup }}>
            {children}
        </PopupContext.Provider>
    );
}
