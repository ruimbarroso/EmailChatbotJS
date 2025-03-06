import { createContext, JSX, useCallback, useContext, useState } from "react";

interface Account {
    email: string;
    login: (newEmail: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    isLoggedIn: () => boolean;
}

const AuthContext = createContext<Account | null>(null);
export const AuthProvider = ({ children }: { children: JSX.Element }) => {
    const [email, setEmail] = useState<string>("");

    const login = useCallback( async (newEmail: string, password: string) => { 
        console.log(`Login: ${newEmail} - ${password}`)
        setEmail(newEmail);
    }, []);
    const logout = useCallback( async () => { 
        setEmail("");
    }, []);
    const isLoggedIn = () => { 
        return email !== "";
    };
    return (<AuthContext.Provider value={{ email, login, logout, isLoggedIn }}>
        {children}
    </AuthContext.Provider>
    );
}
export const useAuth = () => {
    return useContext(AuthContext);
}



