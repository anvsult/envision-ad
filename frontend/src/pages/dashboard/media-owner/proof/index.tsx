'use client';

import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import ProofOfDisplayScreen from './ui/ProofOfDisplayScreen';

export default withPageAuthRequired(function ProofPage() {
    return <ProofOfDisplayScreen />;
});
