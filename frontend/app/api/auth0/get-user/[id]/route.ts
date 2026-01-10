import {NextRequest, NextResponse} from 'next/server';
import { auth0 } from "@/shared/api/auth0/auth0";
import { Auth0ManagementService } from "@/shared/api/auth0/management"; // [cite: 151]

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const session = await auth0.getSession();

    // 1. Security Guard: Ensure the requester is logged in [cite: 65, 66]
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Security Guard: Ensure users can only fetch their own data
    const decodedId = decodeURIComponent(id);
    if (session.user.sub !== decodedId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        // 3. Use the centralized service (handles token caching automatically) [cite: 159, 181]
        const user = await Auth0ManagementService.getUser(decodedId);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (err: any) {
        console.error("Error fetching user:", err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
