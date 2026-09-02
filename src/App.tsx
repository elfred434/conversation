import { AppProvider, useApp } from './state/store'
import Onboarding from './views/Onboarding'
import Home from './views/Home'
import Conversation from './views/Conversation'
import Progress from './views/Progress'
import Pronunciation from './views/Pronunciation'
import Lessons from './views/Lessons'
import Exercises from './views/Exercises'
import Settings from './views/Settings'

function Header(): JSX.Element {
  const { go, view } = useApp()
  return (
    <header className="header">
      <button className="brand" onClick={() => go('home')} aria-label="Accueil FluentFlow">
        <img src="icon.png" alt="" className="brand-icon" />
        <span className="brand-name">FluentFlow</span>
      </button>
      {view !== 'onboarding' && (
        <button className="icon-btn" onClick={() => go('settings')} aria-label="Paramètres" title="Paramètres">
          ⚙️
        </button>
      )}
    </header>
  )
}

function Body(): JSX.Element | null {
  const { view } = useApp()
  switch (view) {
    case 'onboarding':
      return <Onboarding />
    case 'home':
      return <Home />
    case 'conversation':
      return <Conversation />
    case 'progress':
      return <Progress />
    case 'pronunciation':
      return <Pronunciation />
    case 'lessons':
      return <Lessons />
    case 'exercises':
      return <Exercises />
    case 'settings':
      return <Settings />
    default:
      return null
  }
}

export default function App(): JSX.Element {
  return (
    <AppProvider>
      <div className="app">
        <Header />
        <main className="main">
          <Body />
        </main>
      </div>
    </AppProvider>
  )
}
