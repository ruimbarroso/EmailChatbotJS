import { useEffect, useState } from "react";
import { Mailbox, useEmailManager } from "../contexts/Contexts";
import { LoadingPoints } from "../components/LoadingPoints";
import { ScrollableP } from "../components/ScrollableP";
import { PageController } from "../components/PageController";

const MainContent = () => {
    const { getSelectedEmailBox, loadBoxEmails, isLoadingMails } = useEmailManager()
    const [emailBox, setEmailBox] = useState<Mailbox | null>(null);

    useEffect(() => {
        const box = getSelectedEmailBox();
        setEmailBox(box);
        if (box != null && box.Emails == null) loadBoxEmails(box, 1, 10)
    }, [getSelectedEmailBox, loadBoxEmails]);
    return emailBox == null ?
        <div className="flex items-center justify-center w-[calc(100vw)] h-[calc(100vh-6.25rem)] p-4 sm:ml-50"><h1>Select a Mailbox</h1></div> :

        <div className="flex flex-col justify-start items-center box-border w-dvw h-[calc(100vh-6.25rem)] p-4 sm:ml-50 overflow-scroll rounded border-4 border-neutral-950">

            <>{isLoadingMails ?
                <div className="flex items-center justify-center w-[calc(100vw)] h-[calc(100vh-6.25rem)] p-4 sm:ml-50"><LoadingPoints /></div> :
                (!emailBox || !emailBox.Emails || emailBox.Emails.length < 1) ? <h1>No Emails!</h1> : emailBox?.Emails.map((email, index) =>
                    <div key={index} className="flex w-full h-10 rounded bg-[#101010] m-1 p-2 overflow-hidden hover:z-10 hover:drop-shadow-[0_0_0.75rem_dodgerblue]">
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
                                    color="#ffffff" animationDuration="16" />
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
export default MainContent;