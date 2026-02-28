import React, { createContext, useContext, useState } from 'react';

const AutoTradeContext = createContext();

export function AutoTradeProvider({ children }) {
    const [autoTrade, setAutoTrade] = useState(true);
    return (
        <AutoTradeContext.Provider value={{ autoTrade, setAutoTrade }}>
            {children}
        </AutoTradeContext.Provider>
    );
}

export const useAutoTrade = () => useContext(AutoTradeContext);
