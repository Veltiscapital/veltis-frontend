import { ReactNode } from 'react';
import { Navbar } from './Navbar';

interface StandardLayoutProps {
  children: ReactNode;
}

export const StandardLayout = ({ children }: StandardLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 pt-16">
        {children}
      </div>
    </div>
  );
};
