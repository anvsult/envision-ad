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