"use client";

import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import ApprovingMediaDashboard from "@/components/Dashboard/Admin/ApproveMedia/ApprovingMediaDashboard";

export default withPageAuthRequired(function AdminApproveMediaPage() {
    return <ApprovingMediaDashboard />;
});
