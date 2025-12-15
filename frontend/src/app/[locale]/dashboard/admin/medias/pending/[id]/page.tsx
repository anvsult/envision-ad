"use client";

import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import AdminMediaReviewPage from "@/components/Dashboard/Admin/ApproveMedia/AdminMediaReviewPage";

export default withPageAuthRequired(function AdminMediaReviewRoute() {
    return <AdminMediaReviewPage />;
});
