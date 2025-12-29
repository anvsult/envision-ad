import { v2 as cloudinary } from 'cloudinary';

export async function POST(request: Request) {
    const body = (await request.json()) as { paramsToSign: Record<string, string> };
    const { paramsToSign } = body;

    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!apiSecret || apiSecret.trim() === "") {
        // You may choose to throw, or return a 500 error response
        throw new Error("CLOUDINARY_API_SECRET environment variable is not set or is empty.");
    }
    const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

    return Response.json({ signature });
}
    // // Define allowed keys for Cloudinary signature
    // const ALLOWED_KEYS = [
    //     "timestamp",
    //     "public_id",
    //     "folder",
    //     "tags",
    //     "context",
    //     "transformation",
    //     "eager",
    //     "callback",
    //     // Add other allowed keys as needed
    // ];
    // // Validate paramsToSign is an object
    // if (
    //     typeof paramsToSign !== "object" ||
    //     paramsToSign === null ||
    //     Array.isArray(paramsToSign)
    // ) {
    //     return new Response(
    //         JSON.stringify({ error: "Invalid paramsToSign: must be an object." }),
    //         { status: 400, headers: { "Content-Type": "application/json" } }
    //     );
    // }
    // // Filter and validate keys/values
    // const filteredParams: Record<string, string> = {};
    // for (const key of Object.keys(paramsToSign)) {
    //     if (ALLOWED_KEYS.includes(key) && typeof paramsToSign[key] === "string") {
    //         filteredParams[key] = paramsToSign[key];
    //     }
    // }
    // if (Object.keys(filteredParams).length === 0) {
    //     return new Response(
    //         JSON.stringify({ error: "No valid params to sign." }),
    //         { status: 400, headers: { "Content-Type": "application/json" } }
    //     );
    // }
    // const signature = cloudinary.utils.api_sign_request(
    //     filteredParams,
    //     process.env.CLOUDINARY_API_SECRET as string
    // );
    //
    // return Response.json({ signature });
    // }