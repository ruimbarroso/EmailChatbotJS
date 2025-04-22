import { useAppManager, useAuth } from "../contexts/Contexts";
import menuIcon from "../assets/menu.svg";
import closeIcon from "../assets/close.svg";
import googleIcon from "../assets/google.svg";
import logoutIcon from "../assets/logout.svg";
import { useState, useRef, useEffect } from "react";

const TopBar = () => {
    const { email, logout } = useAuth();
    const [isHidden, setIsHidden] = useState(true);
    const { toogleMenu, isMenuExpanded } = useAppManager();
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (menuRef.current) {
            menuRef.current.style.width = `${menuRef.current.parentElement?.offsetWidth}px`;
        }
    }, [isHidden]);

    return (
        <div id="top-bar" className="bg-neutral-950 flex justify-between items-center box-border w-dvw p-4 h-25">
            <div className="w-20 md:w-1/6 lg:w-1/5">
                <div className="flex justify-center items-center box-content w-15 h-15 ml-2 sm:hidden cursor-pointer"
                    onClick={toogleMenu}>
                    <img src={isMenuExpanded ? closeIcon : menuIcon} alt="Menu Icon" className="w-1/2 h-1/2 m-0" />
                </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white text-center">
                EmailChatbot JS
            </h1>

            <div className="relative flex flex-col-reverse items-center justify-end md:flex-row md:items-end lg:w-1/5">
                <p className="cursor-pointer text-white"
                    onMouseEnter={() => setIsHidden(false)}
                    onMouseLeave={() => setIsHidden(true)}>
                    {email}
                </p>
                <div className="flex items-center justify-center box-content w-15 h-15 ml-2 cursor-pointer"
                    onMouseEnter={() => setIsHidden(false)}
                    onMouseLeave={() => setIsHidden(true)}>
                    <img src={googleIcon} alt="Google Logo" className="w-1/2 h-1/2 m-0" />
                </div>
                <div ref={menuRef} className={`absolute bg-black ${isHidden ? "hidden" : ""} opacity-90 right-0 top-full w-full flex flex-col items-center p-2 rounded-md cursor-pointer`}
                    onMouseEnter={() => setIsHidden(false)}
                    onMouseLeave={() => setIsHidden(true)}>
                    <div className="flex justify-around w-1/2" onClick={async () => {
                        try {
                            await logout();
                        } catch (err) {
                            console.log("error logout!", err)
                        }
                    }}>
                        <p className="text-white">Logout</p>
                        <img src={logoutIcon} alt="Logout Icon" className="w-6 h-6 mt-1" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopBar;
