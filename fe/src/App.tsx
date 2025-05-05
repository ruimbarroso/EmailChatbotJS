import { LoginForm } from './components/LoginForm';
import { PopUpMessageComponent } from './components/PopUpMessage';
import { ProtectedPage } from './components/ProtectedPage';
import { AppManagerProvider } from './contexts/AppManagerContext';
import { AuthProvider } from './contexts/AuthContext';
import { EmailManagerProvider } from './contexts/MailManagerContext';
import { PopUpMessageProvider } from './contexts/PopUpMessagesContext';
import MainContent from './sections/MainContent';
import SideMenu from './sections/SideMenu';
import TopBar from './sections/TopBar'

function App() {

  return (<AuthProvider>
    <PopUpMessageProvider>
      <ProtectedPage
        protectedPageBuilder={() =>

          <AppManagerProvider>
            <EmailManagerProvider>
              <>
                <TopBar />
                <div className='flex'>
                  <SideMenu />
                  <MainContent />
                </div>
              </>
            </EmailManagerProvider>
          </AppManagerProvider>

        }
        authPageBuilder={() => <><LoginForm /> <PopUpMessageComponent /></>}>
      </ProtectedPage>
    </PopUpMessageProvider>
  </AuthProvider>);
}

export default App
