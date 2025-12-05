'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Toaster } from '@/components/ui/toaster';
import { UserProvider, useUser } from '@/contexts/UserContext';
import { PanelLeft } from 'lucide-react';
import PageProgressBar from '@/components/dashboard/PageProgressBar';
import { ProgressBarProvider } from '@/contexts/ProgressBarContext';
import { athletes } from '@/lib/mock-data';


function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, setUser, isLoading, setIsLoading } = useUser();
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    // Recuperar el email del localStorage
    const storedEmail = localStorage.getItem('userEmail');
    
    // Simulación de búsqueda de usuario en mock data
    const mockUser = athletes.find(a => 
      `${a.nombres.split(' ')[0].toLowerCase()}.${a.apellidos.split(' ')[0].toLowerCase()}@example.com` === storedEmail
    );
    
    if (storedEmail) {
      // Extraer el nombre de usuario del email si no hay nombre/apellido
      const username = storedEmail.split('@')[0];
      const firstName = mockUser?.nombres || '';
      const lastName = mockUser?.apellidos || '';

      setUser({
        id: mockUser?.id.toString() || "1",
        firstName: firstName,
        lastName: lastName,
        username: (firstName || lastName) ? undefined : username,
        email: storedEmail,
        role: "admin", // Rol por defecto para la simulación
        photoURL: mockUser ? `https://picsum.photos/seed/${mockUser.id}/200/200` : "https://picsum.photos/seed/123/200/200",
        cedula: mockUser?.cedula || "V-12.345.678",
        dateOfBirth: new Date(1990, 5, 15),
        schoolId: "antonio-diaz-dojo",
        school: mockUser?.escuela || "Antonio Díaz Dojo",
        belt: mockUser?.cinturon ||"Negro",
        ranking: mockUser?.ranking || 1,
        representedStudents: [
          { id: 202501, firstName: 'Pedro', lastName: 'Salas' },
          { id: 202502, firstName: 'Ana', lastName: 'González' }
        ]
      });
    }

    setIsLoading(false);
  }, [setUser, setIsLoading]);

  useEffect(() => {
    if (!isLoading && !user) {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-foreground">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return null; // O un componente de redirección
  }

  return (
    <ProgressBarProvider>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <PageProgressBar />
        <Sidebar isOpen={isSidebarOpen} />
        <div className={`flex flex-col sm:gap-4 sm:py-4 transition-all duration-300 ${isSidebarOpen ? 'sm:pl-64' : 'sm:pl-14'}`}>
          <DashboardHeader>
              <button onClick={() => setSidebarOpen(prev => !prev)} className="hidden sm:inline-flex p-2 rounded-md hover:bg-muted-foreground/20 transition-colors">
                  <PanelLeft className="h-5 w-5" />
              </button>
          </DashboardHeader>
          <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <div className="mx-auto grid w-full max-w-7xl gap-2">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProgressBarProvider>
  );
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
        <DashboardLayoutContent>{children}</DashboardLayoutContent>
        <Toaster />
    </UserProvider>
  );
}
