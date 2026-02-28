import React, { createContext, useContext, useState, useEffect } from 'react';

const AutoTradeContext = createContext();

export function AutoTradeProvider({ children }) {
    const [autoTrade, setAutoTrade] = useState(true);
    const [aiState, setAiState] = useState(null);

    useEffect(() => {
        const fetchState = async () => {
            try {
                const res = await fetch(`/ai_state.json?t=${Date.now()}`);
                if (res.ok) {
                    const data = await res.json();
                    setAiState(prev => {
                        // Shallow merge or just replace? Replace is fine for this structure.
                        return data;
                    });
                }
            } catch (err) {
                // Ignore fetch errors
            }
        };

        fetchState();
        const interval = setInterval(fetchState, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <AutoTradeContext.Provider value={{ autoTrade, setAutoTrade, aiState }}>
            {children}
        </AutoTradeContext.Provider>
    );
}

export const useAutoTrade = () => useContext(AutoTradeContext);
