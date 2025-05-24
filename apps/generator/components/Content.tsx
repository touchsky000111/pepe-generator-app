'use client';

import { ThemeProvider } from '@emotion/react';
import { createTheme } from '@mui/material';
import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

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

export interface ContentProps {
  children?: ReactNode;
}

export default function Content({ children }: ContentProps) {
  return (
    <ThemeProvider theme={theme}>
      <Header />
      <div>{children}</div>
      <Footer />
    </ThemeProvider>
  );
}
