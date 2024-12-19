import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { AuthProvider } from "react-oidc-context";
import oidcConfig from "../../oidc.config";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
});

export default function App({ Component, pageProps }: AppProps) {

  const handleSignout = () => {
    window.location.href = '/';
  };

  return (
    <main className={`${inter.variable} font-sans`}>
      <AuthProvider {...oidcConfig} onSignoutCallback={handleSignout}>
        <Component {...pageProps} />
      </AuthProvider>
    </main>
  );
}
