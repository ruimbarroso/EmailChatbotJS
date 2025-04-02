import { useState } from "react";
import { useAuth } from "../contexts/Contexts";

export const LoginForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const {login} = useAuth();
    const submitLoginForm = async (event: React.FormEvent) => {
        event.preventDefault();

       if(!email || !password){throw new Error("Empty Values!");};

        await login(email, password, "gmail");

    };
    return <div className="flex items-center justify-center box-border w-screen h-screen ">
        <form onSubmit={submitLoginForm} className="flex flex-col items-center justify-around box-border w-70 h-120 bg-neutral-950 drop-shadow-[0_0_0.75rem_dodgerblue] rounded">
            <h1 className="text-white">Login</h1>
            <input className="text-white bg-[#171717] rounded h-8 p-1 focus:outline-none focus:ring-2 focus:ring-blue-500 "
                    placeholder="Enter Email"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value )}
                />
                <input className="text-white bg-[#171717] rounded h-8 p-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            <button className="text-white bg-[dodgerblue] hover:bg-[#69b4ff] rounded w-25 h-10" type="submit">Confirm</button>
        </form>
    </div>
};