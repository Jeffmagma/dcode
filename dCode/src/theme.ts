import { ThemeOptions } from '@mui/material/styles';

export const themeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#6c68fb',
    },
    secondary: {
      main: '#9c27b0',
    },
    background: {
      default: '#fff',
      paper: '#fff',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        colorInherit: {
          backgroundColor: '#6c68fb',
          color: '#fff',
        },
      },
      defaultProps: {
        color: 'inherit',
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          color: '#fff', 
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& input': {
            color: '#fff',
          },
        },
      },
    },
  },
};
