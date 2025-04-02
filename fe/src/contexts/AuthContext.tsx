import { JSX, useCallback, useEffect, useState } from "react";
import { AuthContext } from "./Contexts";

const API_URL = import.meta.env.VITE_API_URL;

export const AuthProvider = ({ children }: { children: JSX.Element }) => {
    const [isLoadingUser, setIsLoadingUser] = useState(true);
    const [email, setEmail] = useState<string>("");

    useEffect(() => {
        getCredentials();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const login = useCallback(async (newEmail: string, password: string, provider: string) => {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: newEmail, password: password, provider: provider }),
        });
        if (response.ok) {
            setEmail(newEmail);
        } else {
            throw new Error("User login failed");
        }
    }, []);
    const logout = useCallback(async () => {
        const response = await fetch(`${API_URL}/auth/logout`, {
            method: "POST",
            credentials: "include"
        });
        if (response.ok) {
            setEmail("");
        } else {
            throw new Error("User logout failed");
        }

    }, []);
    const isLoggedIn = () => {
        return email !== "";
    };
    const getCredentials = useCallback(async () => {
        setIsLoadingUser(true);
        const response = await fetch(`${API_URL}/auth/me`, {
            credentials: "include",
            method: "POST"
        });
        if (!response.ok) {
            setEmail("");
            setIsLoadingUser(false);
            throw new Error("User Not logged in");
        }
        try {
            const json = await response.json();
            setEmail(json.email);
            setIsLoadingUser(false);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            setEmail("");
            setIsLoadingUser(false);
            throw new Error("Unable to parse response body");

        }

    }, []);

    return (<AuthContext.Provider value={{ email, login, logout, isLoggedIn, getCredentials, isLoadingUser }}>
        {children}
    </AuthContext.Provider>
    );
}




