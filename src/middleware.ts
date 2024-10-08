import { NextResponse } from 'next/server';
import { parse } from 'cookie';

export function middleware(request: Request) {

const url = new URL(request.url);
const origin = url.origin;
const pathname = url.pathname;
const requestHeaders = new Headers(request.headers);
requestHeaders.set('x-url', request.url);
requestHeaders.set('x-origin', origin);
requestHeaders.set('x-pathname', pathname);

if (pathname.startsWith('/admin')) {
    const cookieHeader = request.headers.get('cookie');
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const adminCookie = process.env.ADMIN_VERIFIED_COOKIE
    // Check if the password cookie is set
    if (adminCookie && cookies[adminCookie] !== 'true') {
      url.pathname = '/login'; // Redirect to login if not verified
      return NextResponse.redirect(url);
    }
  }


if(pathname.startsWith('/about')) { 
    return NextResponse.redirect(new URL('/', request.url))
}



return NextResponse.next({
    request: {
        headers: requestHeaders,
    },

});
}