import Link from "next/link";
import { useSearchParams } from "next/navigation";
import TenantedLoginForm from "@/components/Auth/TenantedLoginForm";
import { findBySlug } from "@/lib/stytch/orgService";
import {getDomainFromRequest} from "@/lib/stytch/urlUtils";
import { headers } from "next/headers";

async function getProps(slug: string | string[] | undefined) {
  const host = headers().get('host')
  const protocol = headers().get('x-forwarded-proto')
  const domain = getDomainFromRequest(host!, protocol!)
  const org = await findBySlug(slug as string);
  return {org, domain};
}

const TenantedLogin = async () => {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");
  const {org, domain} = await getProps(slug as string)
  if (org == null) {
    return (
      <div className="card">
        <div style={{ padding: "24px 40px" }}>
          <h2>Organization not found</h2>
          <p>
            No organization with the domain <strong>{slug}</strong> was found.
          </p>
          <Link href={"/login"}>Try again</Link>
        </div>
      </div>
    );
  } 
  return <TenantedLoginForm org={org} domain={domain}/>;
};


export default TenantedLogin;
