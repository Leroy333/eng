import React from 'react'
import { ThemeProvider } from 'styled-components'
import { DashboardScreen } from './components/DashboardScreen'
import { GlobalStyles } from './styles/GlobalStyles'
import { theme } from './styles/theme'

function App() {

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <div className="app-container">
        <DashboardScreen />
      </div>
    </ThemeProvider>
  )
}

export default App
