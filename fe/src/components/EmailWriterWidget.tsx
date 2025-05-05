import { useEffect, useState } from "react";
import { PopUpMessageType, useAppManager, useAuth, useEmailSender, usePopUpMessage } from "../contexts/Contexts";
import { LoadingPoints } from "./LoadingPoints";

export const EmailWriterWidget = () => {
    const { popElem } = useAppManager();
    const {
        respondingTo,
        to,
        setTo,
        topic,
        setTopic,
        message,
        setMessage,
        attachments,
        setAttachments,
        sendEmail
    } = useEmailSender();
    const { email } = useAuth();

    const [isReply, setIsReply] = useState(false);
    const [originalMessageId, setOriginalMessageId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showOriginalEmail, setShowOriginalEmail] = useState(false);
    const { pushMsg } = usePopUpMessage();

    useEffect(() => {
        if (!respondingTo) {
            setIsReply(false);
            setShowOriginalEmail(false);
        } else {
            setIsReply(true);
            setOriginalMessageId(respondingTo.MessageId);
            setTo(respondingTo.From.reduce((prev, cur) => {
                return { Address: prev.Address + ", " + cur.Address, Name: "" }
            }).Address);
            setTopic(respondingTo.Subject);
            setShowOriginalEmail(true);
        }
    }, [respondingTo]);

    const handleAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newAttachments = await Promise.all(
                Array.from(e.target.files).map(async (file) => {
                    const base64 = await convertToBase64(file);
                    return {
                        name: file.name,
                        type: file.type,
                        base64Content: base64.split(',')[1]
                    };
                })
            );
            setAttachments([...attachments, ...newAttachments]);
        }
    };

    const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const handleSubmit = async () => {
        try {
            if (!to || !topic || !message || isLoading) {
                throw new Error('Please fill all required fields');
            }
            setIsLoading(true);

            const headers = [
                `From: ${email}`,
                `To: ${to.split(',').map(addr => addr.trim()).join(', ')}`,
                `Subject: ${isReply && !topic.startsWith('Re: ') ? `Re: ${topic}` : topic}`,
                `MIME-Version: 1.0`,
            ];

            if (isReply) {
                headers.push(`In-Reply-To: <${originalMessageId}>`);
                headers.push(`References: <${originalMessageId}>`);
            }

            let messageBody = message;
            if (isReply && respondingTo) {
                const quotedText = respondingTo.Body.split('\n')
                    .map(line => `> ${line}`)
                    .join('\n');

                messageBody = `${message}\n\nOn ${respondingTo.Date}, ${respondingTo.From[0].Address} wrote:\n${quotedText}`;
            }

            if (attachments.length > 0) {
                const boundary = `boundary-${Math.random().toString(16).substr(2, 8)}`;
                headers.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);

                const messageParts = [
                    ...headers,
                    '',
                    `--${boundary}`,
                    `Content-Type: text/plain; charset="UTF-8"`,
                    `Content-Transfer-Encoding: 7bit`,
                    '',
                    messageBody,
                ];

                for (const attachment of attachments) {
                    messageParts.push(
                        `--${boundary}`,
                        `Content-Type: ${attachment.type}; name="${attachment.name}"`,
                        `Content-Disposition: attachment; filename="${attachment.name}"`,
                        `Content-Transfer-Encoding: base64`,
                        '',
                        attachment.base64Content,
                        ''
                    );
                }

                messageParts.push(`--${boundary}--`);

                const emailData = {
                    From: email,
                    To: to.split(',').map(addr => addr.trim()),
                    Subject: isReply && !topic.startsWith('Re: ') ? `Re: ${topic}` : topic,
                    Message: messageParts.join('\r\n'),
                    Attachments: attachments
                };

                try {
                    await sendEmail(emailData);
                    pushMsg({
                        type: PopUpMessageType.SUCCESS,
                        message: "Email sent!"
                    })
                } catch (error) {
                    pushMsg({
                        type: PopUpMessageType.ERROR,
                        message: "Unable to send email!"
                    })
                }

            } else {
                headers.push(`Content-Type: text/plain; charset="UTF-8"`);
                headers.push(`Content-Transfer-Encoding: 7bit`);

                const emailData = {
                    From: email,
                    To: to.split(',').map(addr => addr.trim()),
                    Subject: isReply && !topic.startsWith('Re: ') ? `Re: ${topic}` : topic,
                    Message: [
                        ...headers,
                        '',
                        messageBody
                    ].join('\r\n')
                };

                try {
                    await sendEmail(emailData);
                    pushMsg({
                        type: PopUpMessageType.SUCCESS,
                        message: "Email sent!"
                    })
                } catch (error) {
                    pushMsg({
                        type: PopUpMessageType.ERROR,
                        message: "Unable to send email!"
                    })
                }
            }

            setIsLoading(false);
            popElem();

        } catch (error) {
            setIsLoading(false);
            console.error('Email sending error:', error);
        }
    };

    return (
        <div className="h-full w-full flex flex-col bg-[#171717] text-white">
            <div className="w-full p-4 bg-blue-500">
                <h1 className="text-xl font-bold">New Email</h1>
            </div>

            {isLoading ? (
                <div className="h-full flex items-center justify-center">
                    <LoadingPoints />
                </div>
            ) : (
                <div className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto">
                    <div className="flex items-center border-b border-gray-600 py-2">
                        <label className="w-16 font-medium">To:</label>
                        <input
                            type="email"
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                            placeholder="recipient@example.com"
                            className="flex-1 bg-transparent focus:outline-none"
                            disabled={respondingTo != null}
                        />
                    </div>

                    <div className="flex items-center border-b border-gray-600 py-2">
                        <label className="w-16 font-medium">Subject:</label>
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="Email subject"
                            className="flex-1 bg-transparent focus:outline-none"
                            disabled={respondingTo != null}
                        />
                    </div>

                    {isReply && showOriginalEmail && respondingTo !== null && (
                        <div className="border border-gray-600 rounded p-3 bg-gray-800">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-medium">Original Message</h3>
                                <button
                                    onClick={() => setShowOriginalEmail(false)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    ×
                                </button>
                            </div>
                            <div className="text-sm text-gray-300 overflow-y-auto max-h-40">
                                <p className="mb-1"><strong>From:</strong> {respondingTo.From.map(f => f.Address).join(', ')}</p>
                                <p className="mb-1"><strong>Date:</strong> {new Date(respondingTo.Date).toLocaleString()}</p>
                                <p className="mb-1"><strong>Subject:</strong> {respondingTo.Subject}</p>
                                <div className="mt-2 p-2 bg-gray-900 rounded">
                                    {respondingTo.Body.split('\n').map((line, i) => (
                                        <p key={i} className="text-gray-400">{line}</p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {isReply && !showOriginalEmail && (
                        <button
                            onClick={() => setShowOriginalEmail(true)}
                            className="text-sm text-blue-400 hover:text-blue-300 self-start"
                        >
                            Show original message
                        </button>
                    )}

                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Compose your email here..."
                        rows={8}
                        className="flex-1 p-2 bg-transparent border border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                    />
                </div>
            )}

            {attachments.length > 0 && (
                <div className="mt-2 flex items-center overflow-x-scroll px-4">
                    {attachments.map((file, index) => (
                        <div key={index} className="flex items-center mr-2 bg-gray-800 px-2 py-1 rounded">
                            <span className="text-sm">{file.name}</span>
                            <button
                                onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                                className="ml-1 text-red-400 hover:text-red-300"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="w-full p-3 border-t border-gray-800 bg-[#101010]">
                <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                        <input
                            type="file"
                            multiple
                            onChange={handleAttachment}
                            className="hidden"
                            id="attachment-input"
                        />
                        <label
                            htmlFor="attachment-input"
                            className="p-2 text-gray-400 hover:text-white cursor-pointer"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                        </label>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={!to || !message.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};