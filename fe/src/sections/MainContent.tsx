import MailboxPage from "../components/MailboxPage";
import { PopUpMessageComponent } from "../components/PopUpMessage";
import { useAppManager } from "../contexts/Contexts";
import { useEffect } from "react";

const MainContent = () => {
  const { peekElem, pushElem, elemStack } = useAppManager();


  useEffect(() => {
    if (elemStack.length === 0) {
      pushElem(<MailboxPage />);
    }
  }, [elemStack.length, pushElem]);

  return (<>
    {peekElem() || <MailboxPage />}
    <PopUpMessageComponent />
  </>);
};
export default MainContent;