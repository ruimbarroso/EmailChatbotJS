import { useEffect, useState } from "react";
import { PopUpMessageType, useAuth, usePopUpMessage } from "../contexts/Contexts";
import { LoadingPoints } from "./LoadingPoints";
export const LoginForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [provider, setProvider] = useState("gmail"); // Default to Gmail
    const { login } = useAuth();
    const { pushMsg } = usePopUpMessage();

    const [isLoading, setIsloading] = useState(false);

    useEffect(()=>{
        pushMsg({
            type: PopUpMessageType.INFO,
            message: "You need your gmail App password to login!"
        });
    }, []);
    const submitLoginForm = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!email || !password) { throw new Error("Empty Values!"); };

        try {
            setIsloading(true);
            await login(email, password, provider); // Use selected provider
            pushMsg({
                type: PopUpMessageType.SUCCESS,
                message: "You are logged in!"
            })
        } catch (error) {
            pushMsg({
                type: PopUpMessageType.ERROR,
                message: "Unable to login!"
            })
        } finally {
            setIsloading(false);
        }
    };

    return (
        <div className="flex items-center justify-center box-border w-screen h-screen">
            {isLoading ? <LoadingPoints /> :

                <form onSubmit={submitLoginForm} className="flex flex-col items-center justify-around box-border w-70 h-120 bg-neutral-950 drop-shadow-[0_0_0.75rem_dodgerblue] rounded p-4">
                    <h1 className="text-white text-xl mb-4">Login</h1>

                    {/* Provider Select Dropdown */}
                    <select
                        className="text-white bg-[#171717] rounded h-8 p-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full mb-4"
                        value={provider}
                        onChange={(e) => setProvider(e.target.value)}
                    >
                        <option value="gmail">Gmail</option>
                        {/*
                        <option value="outlook">Outlook</option>
                        <option value="mail.com">Mail.com</option>
                        */}
                    </select>

                    <input
                        className="text-white bg-[#171717] rounded h-8 p-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full mb-4"
                        placeholder="Enter Email"
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        className="text-white bg-[#171717] rounded h-8 p-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full mb-4"
                        placeholder="Enter Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                        className="text-white bg-[dodgerblue] hover:bg-[#69b4ff] rounded w-25 h-10 px-4 py-2 transition-colors duration-200"
                        type="submit"
                    >
                        Confirm
                    </button>
                </form>
            }
        </div>
    );
};