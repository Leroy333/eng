import { ThemeProvider } from 'styled-components'
import { useUnit } from 'effector-react'
import { DashboardScreen } from './components/DashboardScreen'
import { WordCardScreen } from './components/WordCardScreen'
import { StatisticsScreen } from './components/StatisticsScreen'
import { GlobalStyles } from './styles/GlobalStyles'
import { theme } from './styles/theme'
import { $currentPage } from './store/app'

function App() {
  const currentPage = useUnit($currentPage)

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardScreen />
      case 'wordCards':
        return <WordCardScreen />
      case 'statistics':
        return <StatisticsScreen />
      default:
        return <DashboardScreen />
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <div className="app-container">
        {renderCurrentPage()}
      </div>
    </ThemeProvider>
  )
}

export default App
