import '../styles/globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import { ThemeProvider } from '../components/ThemeProvider';
import { ToastProvider } from '../components/ToastContext';
import { LanguageProvider } from '../components/LanguageContext';
import { SocketProvider } from '../context/SocketContext';
import { ChatProvider } from '../context/ChatContext';
import ChatButton from '../components/ChatButton';
import NotificationSystem from '../components/NotificationSystem';
import ErrorBoundary from '../components/ErrorBoundary';

import { useEffect, useState } from 'react';
import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SessionProvider session={session}>
          <ThemeProvider>
            <ToastProvider>
              <LanguageProvider>
                <SocketProvider>
                  <ChatProvider>
                    <div className="min-h-screen flex flex-col bg-white text-black antialiased">
                      <Header />
                      <main className="flex-1 px-4 md:px-8 py-6 pb-20 md:pb-6">
                        <Component {...pageProps} />
                      </main>
                      <Footer />
                      <BottomNav />
                      <ChatButton />
                      <NotificationSystem />
                    </div>
                  </ChatProvider>
                </SocketProvider>
              </LanguageProvider>
            </ToastProvider>
          </ThemeProvider>
        </SessionProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default MyApp;