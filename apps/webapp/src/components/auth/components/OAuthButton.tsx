import GoogleIconSvg from "@/assets/icons/google";
import {formatOAuthDiscoveryStartURL, formatOAuthStartURL} from "@/lib/stytch/loadStytch";
import MicrosoftIconSvg from "@/assets/icons/microsoft";
import { Link } from 'react-router-dom';

export enum OAuthProviders {
    Google = 'google',
    Microsoft = 'microsoft',
}

const providerInfo = {
    [OAuthProviders.Google]: {
        providerTypeTitle: 'Google',
        providerIcon: <GoogleIconSvg/>,
    },
    [OAuthProviders.Microsoft]: {
        providerTypeTitle: 'Microsoft',
        providerIcon: <MicrosoftIconSvg/>,
    }
}

type Props = {
    providerType: OAuthProviders;
    hostDomain: string;
    orgSlug?: string;
};

export const OAuthButton = ({ providerType, hostDomain, orgSlug }: Props) => {
    const isDiscovery = orgSlug == null;
    const oAuthStartURL = isDiscovery ? formatOAuthDiscoveryStartURL(hostDomain, providerType) : formatOAuthStartURL(hostDomain, providerType, orgSlug);

    return (
        <Link to={oAuthStartURL} className="oauth-button">
            <div className="oauth-button__icon">{providerInfo[providerType].providerIcon}</div>
            <span className="oauth-button__text">{`Continue with ${providerInfo[providerType].providerTypeTitle}`}</span>
        </Link>
    );
};