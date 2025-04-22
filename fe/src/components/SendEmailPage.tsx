import { useState, useRef, useEffect } from "react";
import { Email, useAppManager } from "../contexts/Contexts";
import BackArrowIcon from "../assets/arrow_back.svg";
import { ChatbotWidget } from "./ChatbotWidget";
import { EmailWriterWidget } from "./EmailWriterWidget";
import { EmailSenderProvider } from "../contexts/EmailSenderContext";

const SendEmailPage = ({ email }: { email: Email | null }) => {
    const { popElem } = useAppManager();
    const [leftWidth, setLeftWidth] = useState(50); // percentage
    const separatorRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDraggingRef = useRef(false);

    const handleMouseDown = () => {
        console.log("MouseDown");
        isDraggingRef.current = true;
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
    };

    const handleMouseUp = () => {
        console.log("MouseUp");
        isDraggingRef.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
    };

    const handleMouseMove = (e: MouseEvent) => {
        console.log("MouseMove");
        if (!isDraggingRef.current || !containerRef.current || !separatorRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const mouseX = e.clientX - containerRect.left;

        // Calculate new width (min 20%, max 80%)
        const newLeftWidth = Math.min(
            Math.max((mouseX / containerWidth) * 100, 20),
            80
        );

        setLeftWidth(newLeftWidth);
    };

    useEffect(() => {
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="flex flex-col justify-start items-center box-border w-dvw h-[calc(100vh-6.25rem)] p-4 sm:ml-50 overflow-hidden rounded border-4 border-neutral-950"
        >
            {/* Header with back button */}
            <div className="flex items-center justify-start w-full h-10 bg-[#101010] p-2 mb-2">
                <div className="cursor-pointer" onClick={popElem}>
                    <img src={BackArrowIcon} alt="Back Arrow Icon" className="w-6 h-6 mt-1 " />
                </div>
            </div>
            <EmailSenderProvider emailToRespond={email}>
                {/* Resizable two-panel layout */}
                <div className="flex h-full w-full relative">
                    {/* Email Writer Panel */}
                    <div
                        className="h-full overflow-hidden p-2 transition-[width] duration-100"
                        style={{ width: `${leftWidth}%` }}
                    >
                        <EmailWriterWidget />
                    </div>

                    {/* Draggable Separator */}
                    <div
                        ref={separatorRef}
                        className="h-full w-4 bg-black flex items-center justify-center cursor-grab hover:bg-blue-600 active:bg-blue-700 transition-colors rounded-2xl"
                        onMouseDown={handleMouseDown}
                    >
                        <div className="pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="#e3e3e3">
                                <path d="M360-160v-640h80v640h-80Zm160 0v-640h80v640h-80Z" />
                            </svg>
                        </div>
                    </div>

                    {/* Chatbot Panel */}
                    <div
                        className="h-full overflow-hidden p-2"
                        style={{ width: `${100 - leftWidth}%` }}
                    >
                        <ChatbotWidget />
                    </div>
                </div>
            </EmailSenderProvider>

        </div>
    );
};

export default SendEmailPage;