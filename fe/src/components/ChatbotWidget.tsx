import { useState } from "react";
import { GroqAiRole, PopUpMessageType, useEmailSender, usePopUpMessage } from "../contexts/Contexts";

export const ChatbotWidget = () => {
    const [prompt, setPrompt] = useState('');
    const { chat, sendPrompt, receivedChat, chooseReceivedChat, clearReceivedChat } = useEmailSender();
    const [choiceIndex, setChoiceIndex] = useState(0);
    const { pushMsg } = usePopUpMessage();

    const handleSubmit = async () => {
        try {
            await sendPrompt(prompt);
            pushMsg({
                type: PopUpMessageType.SUCCESS,
                message: "Prompt sent!"
            })
        } catch (error) {
            pushMsg({
                type: PopUpMessageType.ERROR,
                message: "Unable to send prompt!"
            })
        }

        setPrompt("");
    };

    const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
        const target = e.currentTarget;
        target.style.height = 'auto';
        target.style.height = `${target.scrollHeight}px`;
    };
    const handlePreviousChoice = () => {
        setChoiceIndex(prev => Math.max(0, prev - 1));
    };

    const handleNextChoice = () => {
        setChoiceIndex(prev => Math.min(receivedChat.messages.length - 1, prev + 1));
    };
    return (
        <div className="h-full w-full flex flex-col justify-between bg-[#171717]">
            <div className="w-full p-4 bg-blue-500 text-white">
                <h1 className="text-xl font-bold">Chat</h1>
            </div>

            <div className="flex-1 w-full p-4 overflow-y-auto space-y-2">
                {chat.map((val, i) => {
                    switch (val.role) {
                        case GroqAiRole.USER:
                            return <div id={"msg" + i} className="flex justify-end" >
                                <div className="bg-blue-500 text-white p-3 rounded-lg max-w-xs">
                                    {val.content}
                                </div>
                            </div>;
                        case GroqAiRole.ASSISTANT:
                            return <div id={"msg" + i} className="flex justify-start">
                                <div className="bg-gray-300 p-3 rounded-lg max-w-xs">
                                    {val.content}
                                </div>
                            </div>;
                        default: return "";
                    }
                })}

            </div>

            {receivedChat.messages.length > 0 && (
                <div className="m-4">
                    <div className="flex justify-center cursor-pointer">
                        <div className="bg-green-600 text-white p-3 rounded-lg max-w-xs"
                            onClick={() => {
                                chooseReceivedChat(choiceIndex);

                                clearReceivedChat();
                                setChoiceIndex(0);
                            }}
                        >
                            {receivedChat.messages[choiceIndex].content}
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-4 mb-2">
                        <button
                            onClick={handlePreviousChoice}
                            disabled={choiceIndex === 0}
                            className="p-2 bg-amber-500 text-white rounded disabled:opacity-50 hover:bg-amber-600"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M400-80 0-480l400-400 71 71-329 329 329 329-71 71Z" /></svg>
                        </button>
                        <span className="text-gray-400">
                            {choiceIndex + 1} / {receivedChat.messages.length}
                        </span>
                        <button
                            onClick={handleNextChoice}
                            disabled={choiceIndex === receivedChat.messages.length - 1}
                            className="p-2 bg-amber-500 text-white rounded disabled:opacity-50 hover:bg-amber-600"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="m321-80-71-71 329-329-329-329 71-71 400 400L321-80Z" /></svg>
                        </button>
                    </div>
                </div>
            )}

            <div className="w-full p-4 border-t border-gray-800 bg-[#101010]">
                <div className="flex items-end gap-2">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onInput={handleInput}
                        placeholder="Type your message..."
                        rows={3}
                        className="text-white flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-y-scroll max-h-64"
                        style={{ minHeight: '44px' }}
                    />
                    <button
                        className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors mb-1"
                        disabled={!prompt.trim()}
                        onClick={handleSubmit}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        </div >
    );
};