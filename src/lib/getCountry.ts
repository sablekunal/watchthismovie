'use server';

import { headers } from 'next/headers';

export async function getCountryCode() {
  // 1. Try to get it from Vercel's injected headers (Works in production)
  const headersList = await headers();
  const country = headersList.get('x-vercel-ip-country');

  // 2. Fallback for Localhost (Default to US for better international testing)
  return country || 'US';
}