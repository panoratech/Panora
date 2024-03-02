import { useState } from "react";
import { DiscoveredOrganizations } from "@/lib/stytch/loadStytch";
import { Link } from "react-router-dom";
import useDiscoveredOrganizations from "@/hooks/useDiscoveredOrganizations";
import config from "@/utils/config";
import { useStytchCreateOrganizationFromDiscoveryMutation } from "@/lib/stytch/api";

type Props = {
  discovered_organizations: DiscoveredOrganizations;
};

const DiscoveredOrganizationsList = ({ discovered_organizations }: Props) => {
  
  const formatMembership = ({
    membership,
    organization,
  }: Pick<DiscoveredOrganizations[0], "membership" | "organization">) => {
    if (membership!.type === "pending_member") {
      return `Join ${organization!.organization_name}`;
    }
    if (membership!.type === "eligible_to_join_by_email_domain") {
      return `Join ${organization!.organization_name} via your ${membership!.details!.domain} email`;
    }
    if (membership!.type === "invited_member") {
      return `Accept Invite for ${organization!.organization_name}`;
    }
    return `Continue to ${organization!.organization_name}`;
  };

  return (
    <div className="section">
      <h3>Your Organizations</h3>
      {discovered_organizations.length === 0 && (
        <p>No existing organizations.</p>
      )}
      <ul>
        {discovered_organizations.map(({ organization, membership }) => (
          <li key={organization!.organization_id}>
            <Link to={`${config.API_URL}/auth/stytch/discovery/${organization!.organization_id}`}>
              <span>{formatMembership({ organization, membership })}</span>
            </Link>
          </li> 
        ))}
      </ul>
    </div>
  );
};

const CreateNewOrganization = () => {
  const [orgName, setOrgName] = useState("");
  const [requireMFA, setRequireMFA] = useState(false);

   // Use your custom hook
   const { mutate } = useStytchCreateOrganizationFromDiscoveryMutation();

   // Form submit handler
   const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
     event.preventDefault(); // Prevent traditional form submission
     mutate({ organization_name: orgName, require_mfa: requireMFA });
   };
   
  return (
    <div className="section">
      <h3>Or, create a new Organization</h3>

      <form onSubmit={handleSubmit} className="row">
        <label htmlFor="organization_name">Organization name</label>
        <input
          type={"text"}
          placeholder={`Foo Corp`}
          name="organization_name"
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
        />
        <div className="radio-sso">
          <input
            type="radio"
            id="require_mfa"
            name="require_mfa"
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            onClick={(e) => setRequireMFA(!requireMFA)}
            checked={requireMFA}
          />
          <label htmlFor="require_mfa">Require MFA</label>
        </div>
        <button disabled={orgName.length < 3} type="submit" className="primary">
          Create
        </button>
      </form>
    </div>
  );
};

const Discovery = () => {
  const { data: discoveredOrgs } = useDiscoveredOrganizations();

  if(!discoveredOrgs) return;

  return (
    <div className="card">
      <DiscoveredOrganizationsList
        discovered_organizations={discoveredOrgs}
      />
      <CreateNewOrganization />
    </div>
  );
};

export default Discovery;
