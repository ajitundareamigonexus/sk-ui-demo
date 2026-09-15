import type { Metadata } from 'next';
import BookingPage from '../../components/bookings/BookingPage';

export const metadata: Metadata = {
  title: 'Book Your Ride',
  description: 'Enter your contact and pickup details to secure your premium cab booking instantly.',
};

export default function Page() {
  return <BookingPage />;
}