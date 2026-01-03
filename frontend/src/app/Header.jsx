"use client";
import { usePathname } from 'next/navigation';
import HeaderButton from './HeaderButton';
import LogoutButton from '../components/LogoutButton';
import { Card } from '../components/ui/Card';

export default function Header() {
  const pathname = usePathname();

  const isActive = (path) => pathname === path;

  return (
    <header>
      <Card className="my-header flex items-center justify-between px-6">
        {/* Navigation Group */}
        <div className="flex items-center gap-2">
          <HeaderButton
            myLink="/table/colleges"
            isActive={isActive('/table/colleges')}
          >
            College
          </HeaderButton>
          <HeaderButton
            myLink="/table/programs"
            isActive={isActive('/table/programs')}
          >
            Programs
          </HeaderButton>
          <HeaderButton
            myLink="/table/students"
            isActive={isActive('/table/students')}
          >
            Students
          </HeaderButton>
        </div>

        {/* Right Side: Logout */}
        <div>
          <LogoutButton />
        </div>
      </Card>
    </header>
  );
}