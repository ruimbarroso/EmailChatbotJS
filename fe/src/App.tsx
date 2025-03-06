import './App.css'
import MainContent from './sections/MainContent';
import SideMenu from './sections/SideMenu';
import TopBar from './sections/TopBar'

function App() {

  return (<>
    <TopBar />
    <div className='flex'>
      <SideMenu />
      <MainContent />
    </div>
  </>);
}

export default App
