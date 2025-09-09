import { createGlobalStyle } from 'styled-components'

export const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: ${({ theme }) => theme.fonts.primary};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: ${({ theme }) => theme.colors.dark};
    color: ${({ theme }) => theme.colors.light};
    overflow-x: hidden;
  }

  #root {
    width: 100%;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0;
  }

  .app-container {
    width: 100%;
    max-width: 375px;
    height: 812px;
    background-color: ${({ theme }) => theme.colors.dark};
    border-radius: 0;
    overflow: hidden;
    box-shadow: 0 0 0 1px rgba(234, 234, 235, 0.1);
    position: relative;
  }

  /* Мобильные устройства */
  ${({ theme }) => theme.media.mobile} {
    .app-container {
      max-width: 100%;
      height: 100vh;
      border-radius: 0;
    }
  }

  /* Планшеты */
  ${({ theme }) => theme.media.tablet} {
    .app-container {
      max-width: 480px;
      height: 90vh;
      border-radius: ${({ theme }) => theme.borderRadius.large};
    }
  }

  /* Десктоп */
  ${({ theme }) => theme.media.desktop} {
    .app-container {
      max-width: 600px;
      height: 800px;
      border-radius: ${({ theme }) => theme.borderRadius.large};
    }
  }

  /* Широкие экраны */
  ${({ theme }) => theme.media.wide} {
    .app-container {
      max-width: 700px;
      height: 850px;
    }
  }
`