import { auth0 } from "@/shared/api/auth0/auth0";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const { token } = await auth0.getAccessToken();
        if (!token) {
            return NextResponse.json(
                { error: "No access token found" },
                { status: 401 },
            );
        }
        return NextResponse.json({ accessToken: token });
    } catch (e: any) {
        return NextResponse.json(
            { error: e?.message || "Unauthorized" },
            { status: 401 },
        );
    }
}