import { LoginForm } from './components/LoginForm';
import { ProtectedPage } from './components/ProtectedPage';
import { AppManagerProvider } from './contexts/AppManagerContext';
import { AuthProvider } from './contexts/AuthContext';
import { EmailManagerProvider } from './contexts/MailManagerContext';
import MainContent from './sections/MainContent';
import SideMenu from './sections/SideMenu';
import TopBar from './sections/TopBar'

function App() {

  return (<AuthProvider>
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
      authPageBuilder={() => <LoginForm />}>
    </ProtectedPage>
  </AuthProvider>);
}

export default App
