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
    // Decode ID to handle any URL encoded characters (e.g. pipes in auth0|123)
    const decodedId = decodeURIComponent(id);

    // Validate ID format (basic protection against injection)
    // Auth0 IDs typically look like "provider|id", avoiding special characters that could be malicious in other contexts
    const idRegex = /^[a-zA-Z0-9-]+\|[a-zA-Z0-9-_\.]+$/;
    if (!idRegex.test(decodedId)) {
        return NextResponse.json({ error: 'Invalid User ID format' }, { status: 400 });
    }

    if (session.user.sub !== decodedId) {
        return NextResponse.json({ error: 'Forbidden: You can only update your own profile' }, { status: 403 });
    }

    try {
        const body = await request.json();

        // Validate and sanitize the input
        const allowedFields = ['given_name', 'family_name', 'nickname', 'name', 'user_metadata'];
        const sanitizedBody: any = {};

        for (const key of allowedFields) {
            if (body[key] !== undefined) {
                sanitizedBody[key] = body[key];
            }
        }

        if (body.user_metadata) {
            sanitizedBody.user_metadata = { bio: body.user_metadata.bio };
        }

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
                body: JSON.stringify(sanitizedBody),
            }
        );

        if (!updateRes.ok) {
            let errorMsg = updateRes.statusText || 'Failed to update user';
            try {
                const errorBody = await updateRes.json();
                errorMsg = errorBody.message || errorBody.error_description || errorBody.error || errorMsg;
            } catch (_) {
                // ignore JSON parse errors
            }
            return NextResponse.json(
                { error: errorMsg },
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
