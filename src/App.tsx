import { AppProvider, useApp } from './state/store'
import { Settings as SettingsIcon } from 'lucide-react'
import Onboarding from './views/Onboarding'
import Home from './views/Home'
import Conversation from './views/Conversation'
import Progress from './views/Progress'
import Pronunciation from './views/Pronunciation'
import Lessons from './views/Lessons'
import Exercises from './views/Exercises'
import Phrases from './views/Phrases'
import Grammar from './views/Grammar'
import WordRules from './views/WordRules'
import Conjugaison from './views/Conjugaison'
import Fiches from './views/Fiches'
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
          <SettingsIcon size={19} />
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
    case 'phrases':
      return <Phrases />
    case 'grammar':
      return <Grammar />
    case 'wordrules':
      return <WordRules />
    case 'conjugaison':
      return <Conjugaison />
    case 'fiches':
      return <Fiches />
    case 'settings':
      return <Settings />
    default:
      return null
  }
}

function Shell(): JSX.Element {
  const { view } = useApp()
  return (
    <div className="app">
      <Header />
      <main className="main">
        {/* key=view : remonte la vue a chaque navigation -> transition lente + cascade */}
        <div className="view" key={view}>
          <Body />
        </div>
      </main>
      <footer className="footer">FluentFlow • Apprendre en toute sérénité</footer>
    </div>
  )
}

export default function App(): JSX.Element {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  )
}
