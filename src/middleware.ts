import { isAdminRequest } from '@/app/api/utils/isAdminRequest';
import { NextResponse } from 'next/server';

export async function middleware(request: Request) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-url', request.url);
    requestHeaders.set('x-origin', url.origin);
    requestHeaders.set('x-pathname', pathname);

    if (pathname.startsWith('/admin') && !(await isAdminRequest(request))) {
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    if (pathname.startsWith('/about')) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
}
