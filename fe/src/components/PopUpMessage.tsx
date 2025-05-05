import { JSX, useEffect, useState } from "react";
import { PopUpMessage, PopUpMessageType, usePopUpMessage } from "../contexts/Contexts";



const MessagesTypeData: Record<PopUpMessageType, { color: string, label: string, icon: JSX.Element }> = {
    [PopUpMessageType.INFO]: {
        color: "bg-blue-400",
        label: "Information",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
        )
    },
    [PopUpMessageType.SUCCESS]: {
        color: "bg-green-400",
        label: "Success",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
        )
    },
    [PopUpMessageType.ERROR]: {
        color: "bg-red-400",
        label: "Error",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
        )
    }
};

export const PopUpMessageComponent = () => {
    const { messages, peekMsg, popMsg } = usePopUpMessage();
    const [message, setMessage] = useState<PopUpMessage | null>(null);
    const [messageData, setMessageData] = useState<{
        color: string;
        label: string;
        icon: JSX.Element;
    } | null>(null);

    useEffect(() => {
        const msg = peekMsg();
        setMessage(msg);
        
        if (!msg) {
            setMessageData(null);
            return;
        }
        
        setMessageData(MessagesTypeData[msg.type]);

        const timer = setTimeout(() => {
            popMsg();
        }, 5000);

        return () => clearTimeout(timer);
        
    }, [messages, peekMsg, popMsg]);

    if (!message || !messageData) {
        return null;
    }

    return (
        <div className={`fixed bottom-4 left-4 z-50 ${messageData.color} text-white p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 flex items-start`}>
            <div className="mr-2 mt-0.5">
                {messageData.icon}
            </div>
            <div className="flex-1 mr-2">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold">{messageData.label}</h3>
                    <button
                        onClick={popMsg}
                        className="ml-4 text-white hover:text-gray-200 cursor-pointer"
                    >
                        X
                    </button>
                </div>
                <p className="mt-1 text-sm">{message.message}</p>
            </div>
        </div>
    );
};