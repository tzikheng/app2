import { ThemeProvider } from '@chakra-ui/core'
import { ChakraProvider, ColorModeProvider, CSSReset } from '@chakra-ui/react'
import React from 'react'
import theme from '../theme'
// import { Provider, createClient, fetchExchange, dedupExchange } from 'urql'

function MyApp({ Component, pageProps }: any) {
  return (
    <ThemeProvider>
      {/* <Provider value={client}> */}
        <ChakraProvider resetCSS theme={theme}>
          <ColorModeProvider options={{ useSystemColorMode: true,}}>
            <CSSReset />
            <Component {...pageProps} />
          </ColorModeProvider>
        </ChakraProvider>
      {/* </Provider> */}
    </ThemeProvider>
  )
}

export default MyApp
