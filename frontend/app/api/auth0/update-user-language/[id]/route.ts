import {NextRequest, NextResponse} from 'next/server';
import { Auth0ManagementService } from "@/shared/api/auth0/management";
import { auth0 } from "@/shared/api/auth0/auth0";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth0.getSession();

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (session.user.sub !== id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { locale } = await request.json();

        console.log(locale)

        if (!['en', 'fr'].includes(locale)) {
            return NextResponse.json({ error: 'Invalid locale' }, { status: 400 });
        }

        await Auth0ManagementService.updateUserLanguage(id, locale);

        const res = NextResponse.json({ success: true });
        res.cookies.set('user_preferred_language', locale, {
            maxAge: 60 * 60 * 24 * 365,
            path: '/',
            httpOnly: false,
            sameSite: 'lax',
        });

        return res;
    } catch (error) {
        console.error('Error updating language:', error);
        return NextResponse.json(
            { error: 'Failed to update language' },
            { status: 500 }
        );
    }
}