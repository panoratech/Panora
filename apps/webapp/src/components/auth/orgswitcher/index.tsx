import { useAuth } from "@/context/authHooks";
import useDiscoveredOrganizations from "@/hooks/useDiscoveredOrganizations";
import { Member, DiscoveredOrganizations } from "@/lib/stytch/loadStytch";
import config from "@/utils/config";
import { Link, useNavigate } from "react-router-dom";

type Props = {
  discovered_organizations: DiscoveredOrganizations;
  user: Member;
};

const OrgSwitcherList = ({ discovered_organizations, user }: Props) => {
  return (
    <div className="section">
      <h3>Your Organizations</h3>
      <ul>
        {discovered_organizations.map(({ organization }) => (
          <li key={organization!.organization_id}>
            <Link to={`${config.API_URL}/auth/stytch/discovery/${organization!.organization_id}`}>
              <span>{organization!.organization_name}</span>
              {organization!.organization_id === user.organization_id && (
                <span>&nbsp;(Active)</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

const OrgSwitcher = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { data: discoveredOrgs } = useDiscoveredOrganizations();

  if(!discoveredOrgs) return;

  if (!isAuthenticated) {
    navigate("/login")
    return;
  }
  const props= {
    discovered_organizations: discoveredOrgs,
    user: user!
  };

  return (
    <div className="card">
      <OrgSwitcherList {...props} />
    </div>
  );
};

export default OrgSwitcher;
