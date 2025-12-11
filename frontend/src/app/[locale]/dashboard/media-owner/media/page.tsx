'use client'

import MediaOwnerPage from "@/components/Dashboard/MediaOwner/MediaOwnerDashboard";
import {withPageAuthRequired} from "@auth0/nextjs-auth0";

export default withPageAuthRequired(function Page() {
  return <MediaOwnerPage />;
});
