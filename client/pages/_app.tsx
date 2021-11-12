import type { AppContext, AppProps } from 'next/app';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import 'bootstrap/dist/css/bootstrap.css';
import { GetServerSideProps } from 'next';
import buildClient from '../api/build-client';
import { CurrentUser } from '../interfaces/current-user';
import { AuthWrapper, useAuthContext } from '../context/auth-context';
import App from 'next/app';
import NavHeader from '../components/NavHeader';

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
`;

const theme = {
  colors: {
    primary: '#0070f3',
  },
};

function MyApp({ Component, pageProps }: AppProps) {
  const authContext = useAuthContext();
  authContext.currentUser = pageProps.currentUser;

  return (
    <>
      <GlobalStyle />
      <ThemeProvider theme={theme}>
        <AuthWrapper>
          <NavHeader />
          <div className="container">
            <Component {...pageProps} />
          </div>
        </AuthWrapper>
      </ThemeProvider>
    </>
  );
}

MyApp.getInitialProps = async (appContext: AppContext) => {
  const appProps = await App.getInitialProps(appContext);

  try {
    const { data } = await buildClient(appContext.ctx.req!).get<CurrentUser>(
      '/api/users/currentuser'
    );
    appProps.pageProps = data;
  } catch (error) {
    console.log('Error: ', error);
    appProps.pageProps = { currentUser: null };
  }

  return {
    ...appProps,
  };
};

export default MyApp;
