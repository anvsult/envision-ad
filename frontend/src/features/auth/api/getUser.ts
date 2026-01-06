import {auth0} from "@/shared/api";
import {Employee} from "@/entities/organization";
import {Auth0ManagementService} from "@/shared/api/auth0/management";

export async function getUser(): Promise<Employee | null> {
    const session = await auth0.getSession();

    if (!session || !session.user) {
        return null;
    }

    try {
        const auth0User = await Auth0ManagementService.getUser(session.user.sub)
        return (auth0User as Employee) || (session.user as Employee);
    } catch (error) {
        console.error("Failed to fetch user data:", error)
        return session.user as Employee
    }
}