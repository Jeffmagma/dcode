import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { themeOptions } from './theme';
import { Auth0Provider } from '@auth0/auth0-react';

const theme = createTheme(themeOptions);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
    <Auth0Provider
        domain="dev-6omitcvbhwq5hvfk.us.auth0.com"
        clientId="XUZuvE6pKXJ1di0ZaTnBNpfzxFswNHxI"
        authorizationParams={{ redirect_uri: 'http://localhost:3000/dcode' }}
      >
      <BrowserRouter>
        <App />
      </BrowserRouter>
      </Auth0Provider>
    </ThemeProvider>
  </React.StrictMode>,
);