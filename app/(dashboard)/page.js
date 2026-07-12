'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardIndex() {
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const user = JSON.parse(stored);
      const roleMap = {
        'Admin': '/admin',
        'Asset Manager': '/manager',
        'Department Head': '/department',
        'Employee': '/employee'
      };
      router.push(roleMap[user.role] || '/employee');
    } else {
      router.push('/login');
    }
  }, []);

  return null;
}