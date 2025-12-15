'use client'

import {withPageAuthRequired} from "@auth0/nextjs-auth0";
import {AdCampaigns} from "@/components/Dashboard/Advertiser/AdCampaigns";

export default withPageAuthRequired(function AdvertiserCampaignsPage(){
    return <AdCampaigns />;
});
