import type { Metadata } from 'next';
import MyBookings from '@/components/bookings/MyBookings';

export const metadata: Metadata = {
  title: 'My Bookings',
  description: 'Manage and track your active and past cab bookings.',
};

export default function MyBookingsPage() {
  return <MyBookings />;
}
