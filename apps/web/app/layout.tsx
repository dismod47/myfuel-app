import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { SupabaseUserMenu } from '@/components/shared/SupabaseUserMenu';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MyFuel - Diet & Fitness Tracker',
  description: 'Personal diet and fitness tracking app',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          <nav className="border-b">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <Link href="/dashboard" className="text-2xl font-bold">
                  MyFuel
                </Link>
                
                <div className="hidden md:flex items-center gap-6">
                  <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
                    Today
                  </Link>
                  <Link href="/foods" className="text-sm font-medium hover:text-primary transition-colors">
                    Foods
                  </Link>
                  <Link href="/templates" className="text-sm font-medium hover:text-primary transition-colors">
                    Templates
                  </Link>
                  <Link href="/weekly" className="text-sm font-medium hover:text-primary transition-colors">
                    Weekly
                  </Link>
                  <Link href="/goals" className="text-sm font-medium hover:text-primary transition-colors">
                    Goals
                  </Link>
                  <Link href="/settings" className="text-sm font-medium hover:text-primary transition-colors">
                    Settings
                  </Link>
                </div>

                <SupabaseUserMenu />
              </div>
              
              {/* Mobile Navigation */}
              <div className="md:hidden flex items-center gap-4 mt-4 overflow-x-auto">
                <Link href="/dashboard" className="text-xs font-medium hover:text-primary transition-colors whitespace-nowrap">
                  Today
                </Link>
                <Link href="/foods" className="text-xs font-medium hover:text-primary transition-colors whitespace-nowrap">
                  Foods
                </Link>
                <Link href="/templates" className="text-xs font-medium hover:text-primary transition-colors whitespace-nowrap">
                  Templates
                </Link>
                <Link href="/weekly" className="text-xs font-medium hover:text-primary transition-colors whitespace-nowrap">
                  Weekly
                </Link>
                <Link href="/goals" className="text-xs font-medium hover:text-primary transition-colors whitespace-nowrap">
                  Goals
                </Link>
                <Link href="/settings" className="text-xs font-medium hover:text-primary transition-colors whitespace-nowrap">
                  Settings
                </Link>
              </div>
            </div>
          </nav>
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </div>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}