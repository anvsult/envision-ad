'use client'

import {BusinessEmployees} from "@/components/Dashboard/Business/BusinessEmployees";
import {withPageAuthRequired} from "@auth0/nextjs-auth0";

export default withPageAuthRequired(function BusinessPage(){
    return <BusinessEmployees />;
});
