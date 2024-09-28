import '@mantine/core/styles.css';

import type { AppProps } from 'next/app';
import { createTheme, MantineProvider } from '@mantine/core';
import "../styles/globals.css";

const theme = createTheme({
  
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MantineProvider theme={theme} defaultColorScheme='dark'>
      <Component {...pageProps} />
    </MantineProvider>
  );
}