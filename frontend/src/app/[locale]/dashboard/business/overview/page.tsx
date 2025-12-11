'use client'

import { BusinessDashboard } from "@/components/Dashboard/Business/BusinessDashboard";
import {withPageAuthRequired} from "@auth0/nextjs-auth0";

export default withPageAuthRequired(function BusinessPage(){
    return <BusinessDashboard />;
});
