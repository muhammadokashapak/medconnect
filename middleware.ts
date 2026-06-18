import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function decodeJwt(token: string) {
  try {
    const payload = token.split('.')[1];
    const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodedPayload);
  } catch (e) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('medconnect_token')?.value;

  const isAuthPage = request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register';
  
  const protectedPrefixes = [
    '/profile', 
    '/dashboard', 
    '/feed', 
    '/create-case', 
    '/case', 
    '/verification', 
    '/admin', 
    '/doctors', 
    '/doctor', 
    '/messages', 
    '/ai', 
    '/notifications', 
    '/saved-cases', 
    '/activity', 
    '/analytics', 
    '/appointments', 
    '/consultations', 
    '/call-history', 
    '/conference', 
    '/video',
    '/knowledge',
    '/guidelines',
    '/drugs',
    '/drug-interaction',
    '/calculators',
    '/research',
    '/news',
    '/learning',
    '/hospitals',
    '/hospital',
    '/department',
    '/organizations',
    '/hospital-admin',
    '/announcements',
    '/events',
    '/cme',
    '/patients',
    '/patient',
    '/queue',
    '/patient-portal',
    '/erp',
    '/ai/diagnosis',
    '/ai/prescription',
    '/ai/soap'
  ];
  const isProtectedPage = protectedPrefixes.some(prefix => request.nextUrl.pathname.startsWith(prefix));

  if (isProtectedPage && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  let role = 'DOCTOR';
  let verificationStatus = 'PENDING';
  let isLegacyUser = false;
  if (token) {
    const decoded = decodeJwt(token);
    if (decoded?.role) {
      role = decoded.role;
    }
    if (decoded?.verificationStatus) {
      verificationStatus = decoded.verificationStatus;
    }
    if (decoded?.isLegacyUser) {
      isLegacyUser = decoded.isLegacyUser;
    }
  }

  // Define routes that require the user to be fully verified
  const requireVerifiedPrefixes = [
    '/feed', '/create-case', '/case', '/messages', '/ai', '/patients', '/appointments', '/consultations'
  ];

  const requiresVerification = requireVerifiedPrefixes.some(prefix => request.nextUrl.pathname.startsWith(prefix));

  if (requiresVerification && verificationStatus !== 'VERIFIED' && !isLegacyUser) {
    return NextResponse.redirect(new URL('/verification', request.url));
  }

  if (request.nextUrl.pathname.startsWith('/verification') && (verificationStatus === 'VERIFIED' || isLegacyUser)) {
    return NextResponse.redirect(new URL('/feed', request.url));
  }

  const isAdminPage = request.nextUrl.pathname.startsWith('/admin');
  
  if (isAdminPage && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/feed', request.url));
  }

  if (isAuthPage && token) {
    if (role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', request.url));
    } else {
      return NextResponse.redirect(new URL('/feed', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/profile/:path*', 
    '/dashboard/:path*', 
    '/feed/:path*', 
    '/create-case/:path*', 
    '/case/:path*', 
    '/verification/:path*',
    '/admin/:path*',
    '/doctors/:path*',
    '/doctor/:path*',
    '/messages/:path*',
    '/ai/:path*',
    '/notifications/:path*',
    '/saved-cases/:path*',
    '/activity/:path*',
    '/analytics/:path*',
    '/appointments/:path*',
    '/consultations/:path*',
    '/call-history/:path*',
    '/conference/:path*',
    '/video/:path*',
    '/login', 
    '/register'
  ],
};
