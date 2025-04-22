import { useEffect, useState } from "react";
import { PaginatedMailbox, useAppManager, useEmailManager } from "../contexts/Contexts";
import { LoadingPoints } from "./LoadingPoints";
import { ScrollableP } from "./ScrollableP";
import { PageController } from "./PageController";
import refreshIcon from "../assets/refresh.svg"
import addIcon from "../assets/add.svg"
import { ReadEmailPage } from "./ReadEmailPage";
import SendEmailPage from "./SendEmailPage";

const MailboxPage = () => {
    const { getSelectedEmailBox, loadBoxEmails, selectedPage } = useEmailManager();
    const { pushElem } = useAppManager();
    const [emailBox, setEmailBox] = useState<PaginatedMailbox | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchEmails = async () => {
            const box = getSelectedEmailBox();
            setEmailBox(box);
            if (!box) return;

            if (!box.Pages[selectedPage]) {
                setIsLoading(true);
            } else {
                setIsLoading(false);
            }
        };

        fetchEmails();
    }, [getSelectedEmailBox, loadBoxEmails, selectedPage]);
    return emailBox == null ?
        <div className="flex items-center justify-center w-[calc(100vw)] h-[calc(100vh-6.25rem)] p-4 sm:ml-50"><h1>Select a Mailbox</h1></div> :
        <div className="flex flex-col justify-start items-center box-border w-dvw h-[calc(100vh-6.25rem)] p-4 sm:ml-50 overflow-scroll rounded border-4 border-neutral-950">
            <div className="flex items-center justify-between w-full h-10 bg-[#101010] p-2 mb-2">
                <div className="cursor-pointer" onClick={async () => {
                    const box = getSelectedEmailBox();
                    if (!box) return;
                    setIsLoading(true);
                    await loadBoxEmails(box, selectedPage, 10)
                    setIsLoading(false);
                }}>
                    <img src={refreshIcon} alt="Refresh Icon" className="w-6 h-6 mt-1 " />
                </div>

                <div>
                    <div className="cursor-pointer" onClick={async () => {
                        pushElem(<SendEmailPage email={null} />);
                    }}>
                        <img src={addIcon} alt="Add Icon" className="w-6 h-6 mt-1 " />
                    </div>
                </div>
            </div>
            <>{isLoading ?
                <div className="flex items-center justify-center w-[calc(100vw)] h-[calc(100vh-6.25rem)] p-4 sm:ml-50"><LoadingPoints /></div> :
                (!emailBox || !emailBox.Pages[selectedPage] || emailBox.Pages[selectedPage].length < 1) ? <h1>No Emails!</h1> : emailBox?.Pages[selectedPage].map((email, index) =>
                    <div key={index} className="flex w-full h-10 rounded bg-[#101010] m-1 p-2 overflow-hidden hover:drop-shadow-[0_0_0.75rem_dodgerblue] cursor-pointer"
                        onClick={() => {

                            pushElem(<ReadEmailPage email={email} />);
                        }}>
                        <div className="min-w-35 mr-4 ml-2">
                            <ScrollableP
                                textContent={email.From.reduce((prev, curr) => { return { Name: prev.Name + ", " + curr.Name, Address: "" } }).Name}
                                color="#ffffff" animationDuration="4" />
                        </div>
                        <div className="min-w-[calc(100%-20rem)] flex overflow-hidden">
                            <div className="w-1/2 mr-2 ml-2">
                                <ScrollableP
                                    textContent={email.Subject}
                                    color="#ffffff" animationDuration="4" />
                            </div>
                            <div className="w-1/2 mr-2 ml-2">
                                <ScrollableP
                                    textContent={email.Body}
                                    color="#bfbfbf" animationDuration="16" />
                            </div>
                        </div>
                        <div className="min-w-35 mr-2 ml-4">
                            <ScrollableP
                                textContent={new Date(email.Date).toDateString()}
                                color="#ffffff" animationDuration="4" />
                        </div>
                        {(email.Attachments.length > 0) ? email.Attachments.map(attachment => <div>{attachment}</div>) : ""}
                    </div>)}
                <div className="absolute bottom-4"><PageController /></div>
            </>
        </div>;


};
export default MailboxPage;