import { AppProps } from "next/app"; // Import AppProps to type the props
import "../styles/globals.css"; // Import your global styles here

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
