import { useEffect } from "react";
import { Provider } from "react-redux";
import { ToastProvider } from 'react-toast-notifications';
import { ThemeProvider } from '@mui/material/styles';
import { ThemeProvider as StyledThemeProvider } from "styled-components";
import { StyledEngineProvider } from '@mui/material/styles';
import store from './redux/store'
import GlobalStyles from "./global-styles";
import Routes from "./routes";
import "./assets/css/bootstrap-grid.min.css";
import CustomToast from "./components/Toast";
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { QueryClient, QueryClientProvider } from "react-query";
import { theme, colors } from './theme';
import { LicenseInfo } from '@mui/x-license-pro';
import { updateAxiosInstanceHeader } from 'services/axios';
import { updateAxiosHeaders } from 'services/mainAxios';
import { useTranslation } from 'react-i18next';
LicenseInfo.setLicenseKey(`${process.env.REACT_APP_MUI_X_KEY}`);

function App() {
  const { i18n } = useTranslation();
  useEffect(() => {

    const lang = i18n.language;
    updateAxiosInstanceHeader(lang);
    updateAxiosHeaders(lang);
    initialLanguage();
  }, []);

  const initialLanguage = async () => {
    const lang = await localStorage.getItem('lang');
    if (lang) {
      await localStorage.setItem('lang', lang);
    }
    else {
      await localStorage.setItem('lang', 'ka');
    }
  }

  const queryClient = new QueryClient();

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <StyledThemeProvider theme={colors}>
          <ToastProvider placement='top-center' components={{ Toast: CustomToast }}>
            <Provider store={store}>
              <GlobalStyles />
              <QueryClientProvider client={queryClient}>
                <GoogleReCaptchaProvider
                  reCaptchaKey={process.env.REACT_APP_CAPTCHA_KEY as string}
                  language="en"
                >
                  <Routes />
                </GoogleReCaptchaProvider>
              </QueryClientProvider>
            </Provider>
          </ToastProvider>
        </StyledThemeProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

export default App;
