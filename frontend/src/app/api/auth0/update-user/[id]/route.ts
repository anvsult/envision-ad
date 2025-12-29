import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from "@/lib/auth0/auth0";
import { Auth0ManagementService } from "@/lib/auth0/management";
import { mapAuth0UserToUser } from "@/services/UserService";

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
    // Auth0 IDs typically look like "provider|id"; allow any non-whitespace characters while disallowing extra pipes in the provider part
    const idRegex = /^[^\s]+\|[^\s]+$/;
    if (!idRegex.test(decodedId)) {
        return NextResponse.json({ error: 'Invalid User ID format' }, { status: 400 });
    }

    if (session.user.sub !== decodedId) {
        return NextResponse.json({ error: 'Forbidden: You can only update your own profile' }, { status: 403 });
    }

    try {
        const body = await request.json();

        // Simple HTML-escaping sanitization to mitigate XSS when these values are rendered in HTML contexts.
        const sanitizeString = (value: string): string =>
            value
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#x27;')
                .replace(/\//g, '&#x2F;');

        // Validate that a field is a non-empty string, enforce a max length, and sanitize it.
        const validateAndSanitizeTextField = (value: unknown, maxLength: number): string | undefined => {
            if (typeof value !== 'string') {
                return undefined;
            }
            const trimmed = value.trim();
            if (!trimmed) {
                return undefined;
            }
            if (trimmed.length > maxLength) {
                return undefined;
            }
            return sanitizeString(trimmed);
        };

        // Validate and sanitize the input
        // Map camelCase input to snake_case for Auth0
        const inputMapping: Record<string, string> = {
            givenName: 'given_name',
            familyName: 'family_name',
            nickname: 'nickname',
            name: 'name',
            userMetadata: 'user_metadata'
        };

        const allowedFields = Object.keys(inputMapping);
        const sanitizedBody: any = {};

        // Validations for specific fields
        for (const inputKey of allowedFields) {
            if (body[inputKey] === undefined) {
                continue;
            }

            const auth0Key = inputMapping[inputKey];

            if (inputKey === 'givenName' || inputKey === 'familyName' || inputKey === 'nickname') {
                const sanitized = validateAndSanitizeTextField(body[inputKey], 100);
                if (sanitized !== undefined) {
                    sanitizedBody[auth0Key] = sanitized;
                }
                continue;
            }

            if (inputKey === 'name') {
                const sanitized = validateAndSanitizeTextField(body[inputKey], 200);
                if (sanitized !== undefined) {
                    sanitizedBody[auth0Key] = sanitized;
                }
                continue;
            }

            if (inputKey === 'userMetadata' && body.userMetadata && typeof body.userMetadata === 'object') {
                const metadata: any = {};
                // Note: Only the 'bio' field from user_metadata is supported and forwarded to Auth0.
                if ('bio' in body.userMetadata) {
                    const sanitizedBio = validateAndSanitizeTextField(
                        (body.userMetadata as any).bio,
                        1000
                    );
                    if (sanitizedBio !== undefined) {
                        metadata.bio = sanitizedBio;
                    }
                }
                if (Object.keys(metadata).length > 0) {
                    sanitizedBody[auth0Key] = metadata;
                }
            }
        }

        // Update User in Auth0 via Management Service (handles token caching)
        const updatedUserRaw = await Auth0ManagementService.updateUser(decodedId, sanitizedBody);

        const updatedUser = mapAuth0UserToUser(updatedUserRaw);

        return NextResponse.json(updatedUser);
    } catch (err: any) {
        console.error("Error updating user:", err);
        return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
    }
}
