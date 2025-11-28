// 📄 app/layout.tsx - VERSÃO TEMPORÁRIA SEM ONLINE STATUS
import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ToastContainer from "../components/toast-container";
import { SessionAlert } from '../components/session-alert'

export const metadata = {
  title: "Sistema HOT - GSST",
  description: "Sistema de Classificação HOT - Humano, Organizacional, Técnico"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
        <AuthProvider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <ToastContainer />
            <SessionAlert /> {/* 🔄 ADICIONE ESTA LINHA */}
          {/* OnlineStatus removido temporariamente */}
        </AuthProvider>
      </body>
    </html>
  );
}