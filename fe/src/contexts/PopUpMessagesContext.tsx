import { JSX, useCallback, useState } from "react";
import { PopUpMessage, PopUpMessageContext } from "./Contexts";

export const PopUpMessageProvider = ({ children }: { children: JSX.Element }) => {
    const [messages, setMessages] = useState<PopUpMessage[]>([]);

    const pushMsg = useCallback((msg: PopUpMessage) => {
        setMessages(prev => [...prev, msg]);
    }, []);

    const peekMsg = useCallback(() => {
        return messages.length > 0 ? messages[messages.length - 1] : null;
    }, [messages]);

    const popMsg = useCallback(() => {
        setMessages(prev => prev.slice(0, -1));
    }, []);

    const replaceAllMsg = useCallback((msg: PopUpMessage) => {
        setMessages(() => [msg]);
    }, []);

    return (<PopUpMessageContext.Provider value={{
        messages,
        pushMsg,
        peekMsg,
        popMsg,
        replaceAllMsg
    }}>
        {children}
    </PopUpMessageContext.Provider>
    );
}