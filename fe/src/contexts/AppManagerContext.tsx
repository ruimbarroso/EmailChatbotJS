import { JSX, useCallback, useState } from "react";
import { AppManagerContext } from "./Contexts";
import MailboxPage from "../components/MailboxPage";

export const AppManagerProvider = ({ children }: { children: JSX.Element }) => {
    const [isMenuExpanded, setIsMenuExpanded] = useState(false);
    const [elemStack, setElemStack] = useState<JSX.Element[]>([<MailboxPage />]);

    
    const pushElem = useCallback((elem: JSX.Element) => {
        setElemStack(prev => [...prev, elem]);
      }, []);
    
      const peekElem = useCallback(() => {
        return elemStack.length > 0 ? elemStack[elemStack.length - 1] : null;
      }, [elemStack]);
    
      const popElem = useCallback(() => {
        setElemStack(prev => prev.slice(0, -1)); 
      }, []);

      const replaceAllElem = useCallback((elem: JSX.Element) => {
        setElemStack(() => [elem]);
      }, []);

    const toogleMenu = useCallback(() => {
        setIsMenuExpanded(prev => !prev)
    }, [])


    return (<AppManagerContext.Provider value={{
        isMenuExpanded,
        toogleMenu,

        elemStack,
        pushElem,
        peekElem,
        popElem,
        replaceAllElem
    }}>
        {children}
    </AppManagerContext.Provider>
    );
}