import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from "@/lib/auth0/auth0";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    // Ensure the user is authenticated and is updating their own profile
    const session = await auth0.getSession();
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the user is updating themselves (basic security check)
    if (session.user.sub !== decodeURIComponent(id)) {
        return NextResponse.json({ error: 'Forbidden: You can only update your own profile' }, { status: 403 });
    }

    try {
        const body = await request.json();

        // Get Management API Token
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

        if (!tokenRes.ok) {
            let errorMsg = 'Failed to obtain Auth0 Management API token';
            try {
                const errorBody = await tokenRes.json();
                errorMsg = errorBody.error_description || errorBody.error || errorMsg;
            } catch (_) {
                // ignore JSON parse errors
            }
            return NextResponse.json({ error: errorMsg }, { status: tokenRes.status });
        }

        const tokenJson = await tokenRes.json();
        const { access_token } = tokenJson;
        if (!access_token) {
            return NextResponse.json({ error: 'No access token returned from Auth0' }, { status: 500 });
        }
        // Update User in Auth0
        const updateRes = await fetch(
            `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${id}`,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${access_token}`,
                },
                body: JSON.stringify(body),
            }
        );

        if (!updateRes.ok) {
            return NextResponse.json(
                { error: updateRes.statusText },
                { status: updateRes.status }
            );
        }

        const updatedUser = await updateRes.json();
        return NextResponse.json(updatedUser);
    } catch (err) {
        console.error("Error updating user:", err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
