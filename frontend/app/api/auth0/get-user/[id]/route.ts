import {NextRequest, NextResponse} from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const tokenRes = await fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                client_id: process.env.AUTH0_MGMT_CLIENT_ID,
                client_secret: process.env.AUTH0_MGMT_CLIENT_SECRET,
                audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
                grant_type: 'client_credentials',
            }),
        });

        const { access_token } = await tokenRes.json()

        const userRes = await fetch(
            `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            }
        );

        if (!userRes.ok) {
            return NextResponse.json(
                { error: userRes.statusText },
                { status: userRes.status }
            );
        }

        const user = await userRes.json();
        return NextResponse.json(user);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
