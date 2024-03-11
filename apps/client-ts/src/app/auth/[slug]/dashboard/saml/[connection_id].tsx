import { findByID } from "@/lib/stytch/orgService";
import { FormEventHandler } from "react";
import { updateSamlSSOConn } from "@/lib/stytch/api";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { formatSSOStartURL } from "@/lib/stytch/loadStytch";
import { getAuthData} from "@/lib/stytch/sessionService";
import Link from "next/link";
import { list } from "@/lib/stytch/ssoService"; 
import {getDomainFromRequest} from "@/lib/stytch/urlUtils";
import { headers } from "next/headers";
import { Input } from "@/components/ui/input"


async function getProps(connection_id: string) {
  const authHeader = headers().get('x-session');
  const { member } = getAuthData(authHeader);

  const org = await findByID(member.organization_id);
  if (org === null) {
    return { redirect: { statusCode: 307, destination: `/auth/login` } };
  }

  const connection = await list(org.organization_id).then((res) =>
    res.saml_connections.find((conn) => conn.connection_id === connection_id)
  );

  if (!connection) {
    return {
      redirect: {
        statusCode: 307,
        destination: `/${org.organization_slug}/dashboard`,
      },
    };
  }
  const host = headers().get('host')
  const protocol = headers().get('x-forwarded-proto')

  return {
    connection: connection,
    domain: getDomainFromRequest(host!, protocol!)
  };
}
async function ConnectionEditPage() {
  const router = useRouter();
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const connection_id = searchParams.get("connection_id");

  const {connection, domain} = await getProps(connection_id as string);

  const onSubmit: FormEventHandler = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target as HTMLFormElement);

    await updateSamlSSOConn({
      certificate: data.get("certificate") as string,
      connection_id: connection!.connection_id,
      display_name: data.get("display_name") as string,
      email_attribute: data.get("email_attribute") as string,
      first_name_attribute: data.get("first_name_attribute") as string,
      idp_entity_id: data.get("idp_entity_id") as string,
      idp_sso_url: data.get("idp_sso_url") as string,
      last_name_attribute: data.get("last_name_attribute") as string,
    });

    // Force a reload to refresh the conn list
    router.replace(pathname);
  };

  return (
    <>
      <div className="card">
        <form onSubmit={onSubmit} style={{ minWidth: 400 }}>
          <h1>Edit SAML Connection</h1>
          <label htmlFor="display_name">Display Name</label>
          <Input 
            type="text"
            name="display_name"
            value={connection!.display_name}
            disabled
          />
          <label htmlFor="status">Status</label>
          <Input type="text" name="status" disabled value={connection!.status} />
          <label htmlFor="acs_url">ACS URL</label>
          <Input
            type="text"
            name="acs_url"
            disabled
            value={connection!.acs_url}
          />
          <label htmlFor="audience_uri">Audience URI</label>
          <Input
            type="text"
            name="audience_uri"
            disabled
            value={connection!.audience_uri}
          />
          <label htmlFor="idp_sso_url">SSO URL</label>
          <Input
            type="text"
            name="idp_sso_url"
            placeholder="https://idp.com/sso/start"
            defaultValue={connection!.idp_sso_url}
          />
          <label htmlFor="idp_entity_id">IDP Entity ID</label>
          <Input
            type="text"
            name="idp_entity_id"
            placeholder="https://idp.com/sso/start"
            defaultValue={connection!.idp_entity_id}
          />
          <label htmlFor="email_attribute">Email Attribute</label>
          <Input
            type="text"
            name="email_attribute"
            placeholder="NameID"
            defaultValue={connection!.attribute_mapping!["email"]}
          />
          <label htmlFor="first_name_attribute">First Name Attribute</label>
          <Input
            type="text"
            name="first_name_attribute"
            placeholder="firstName"
            defaultValue={connection!.attribute_mapping!["first_name"]}
          />
          <label htmlFor="last_name_attribute">Last Name Attribute</label>
          <Input
            type="text"
            name="last_name_attribute"
            placeholder="lastName"
            defaultValue={connection!.attribute_mapping!["last_name"]}
          />
          <label htmlFor="certificate">Signing Certificate</label>
          <textarea
            name="certificate"
            placeholder="-------BEGIN ------"
            defaultValue={connection!.verification_certificates[0]?.certificate}
          />
          <button className="primary" type="submit">
            Save
          </button>
        </form>
        <a
          style={{ minWidth: 400, margin: 10 }}
          href={formatSSOStartURL(domain!, connection!.connection_id)}
        >
          <button className="secondary">Test connection</button>
        </a>
        <Link
          style={{ marginRight: "auto" }}
          href={`/${searchParams.get('slug')}/dashboard`}
        >
          Back
        </Link>
      </div>
    </>
  );
}
export default ConnectionEditPage;
