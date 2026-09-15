import type { Metadata } from 'next';
import CabListingPage from '@/components/CabListingPage';

export const metadata: Metadata = {
  title: 'Available Cabs & Fleet',
  description: 'Choose from our wide range of premium cabs, including Sedan CNG, Sedan Diesel, SUV, Innova Crysta, Fortuner and Force Travellers.',
};

export default function CabsPage() {
  return <CabListingPage />;
}