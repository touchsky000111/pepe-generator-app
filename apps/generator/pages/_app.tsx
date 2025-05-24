import '@/styles/globals.css';

import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '@emotion/react';
import { createTheme } from '@mui/material';
import type { AppProps } from 'next/app';
import Head from 'next/head';

import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';

const theme = createTheme({
  components: {
    MuiAccordion: {
      defaultProps: {
        style: {
          backgroundColor: 'transparent',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        style: {
          backgroundColor: 'transparent',
          borderRadius: '50px',
        },
      },
      styleOverrides: {
        root: {
          '&:hover': {
            color: '#FFFFFF',
          },
        },
      },
    },
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiFormControl: {
      defaultProps: {
        variant: 'standard',
      },
    },
    MuiIcon: {
      defaultProps: {
        style: {
          color: 'black',
        },
      },
    },
    MuiIconButton: {
      defaultProps: {
        style: {
          backgroundColor: 'black',
        },
      },
      styleOverrides: {
        root: {
          '&:disabled': {
            opacity: '.25',
          },
          '&:hover': {
            backgroundColor: '#333',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'standard',
      },
    },
  },
  palette: {
    mode: 'dark',
    primary: {
      main: '#FFFFFF',
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Pepe Generator</title>
        <meta name="description" content="Generate Pepes" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ClerkProvider {...pageProps}>
        <ThemeProvider theme={theme}>
          <Header />
          <Component {...pageProps} />
          <Footer />
        </ThemeProvider>
      </ClerkProvider>
    </>
  );
}
