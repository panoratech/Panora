import TenantedLoginForm from "@/components/auth/components/TenantedLoginForm";
import { findBySlug } from "@/lib/stytch/orgService";
import { Link } from "react-router-dom";
import { useLocation } from 'react-router-dom';


export const TenantedLogin = async () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const slug = queryParams.get('slug'); 
    const org = await findBySlug(slug!);
    
  const protocol = window.location.protocol; // "http:" or "https:"
  const host = window.location.host; // Includes hostname and port if present
  const domain = `${protocol}//${host}`;
  
  if (org == null) {
    return (
      <div className="card">
        <div style={{ padding: "24px 40px" }}>
          <h2>Organization not found</h2>
          <p>
            No organization with the domain <strong>{slug}</strong> was found.
          </p>
          <Link to={"/login"}>Try again</Link>
        </div>
      </div>
    );
  }
  return <TenantedLoginForm org={org} domain={domain}/>;
};
