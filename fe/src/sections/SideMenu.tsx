import { PopUpMessageType, useAppManager, useEmailManager, usePopUpMessage } from "../contexts/Contexts";
import { LoadingPoints } from '../components/LoadingPoints';
import { ScrollableP } from '../components/ScrollableP';
import { useEffect, useState } from "react";
import MailboxPage from "../components/MailboxPage";

const SideMenu = () => {
    const { Mailboxes, selectEmailBox, selectedBox, loadBoxEmails, loadEmailBoxes } = useEmailManager();
    const { isMenuExpanded, replaceAllElem } = useAppManager();
    const [isLoadingMailBoxes, setIsLoadingMailboxes] = useState(true)
    const { pushMsg } = usePopUpMessage();
    useEffect(() => {
        const loadBoxes = async () => {
            setIsLoadingMailboxes(true);
            try {
                await loadEmailBoxes();
            } catch (error) {
                pushMsg({
                    type: PopUpMessageType.ERROR,
                    message: "Unable to load email inboxes!"
                })
            }
            setIsLoadingMailboxes(false);
        }

        loadBoxes();
    }, [loadEmailBoxes]);
    return (
        <div className={`${isMenuExpanded ? "flex" : "hidden"} z-2 absolute left-0 sm:flex bg-neutral-950 flex-col items-stretch justify-start box-border h-[calc(100vh-6.25rem)] pt-4 w-50`}>
            {isLoadingMailBoxes ?
                <div className='flex items-center justify-center h-10'><LoadingPoints /></div>
                : Mailboxes.map((box, index) => (
                    <div key={index} className={`h-10 m-0 p-1 flex justify-between bg-neutral-950 hover:drop-shadow-[0.25rem_0_0_dodgerblue] transition-all duration-200 ${selectedBox == index ? "border-b-2 border-blue-500" : ""} cursor-pointer`}
                        onClick={() => {
                            selectEmailBox(index)
                            replaceAllElem(<MailboxPage />)
                            loadBoxEmails(Mailboxes[index], 1, 10).catch((err) => {
                                pushMsg({
                                    type: PopUpMessageType.ERROR,
                                    message: "Unable to load first page!"
                                })
                            });
                        }}>
                        <ScrollableP textContent={box.Name} color="#ffffff" animationDuration="8" />
                        {box.NumUnseen > 0 ? <ScrollableP textContent={box.NumUnseen > 999 ? "+999" : (box.NumUnseen + '')} color="#ffffff" animationDuration="8" /> : ""}
                    </div>
                ))
            }


        </div >

    );
};


export default SideMenu;