'use client'

import {
  FormEventHandler,
  MouseEventHandler,
  useEffect,
  useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input"

import {
  createOidcSSOConn,
  createSamlSSOConn,
  deleteMember,
  invite,
} from "@/lib/stytch/api";
import {
  Member,
  OIDCConnection,
  Organization,
  SAMLConnection,
} from "@/lib/stytch/loadStytch";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Separator } from "@/components/ui/separator"
import { CircleIcon } from "@radix-ui/react-icons"


type Props = {
  org: Organization;
  user: Member;
  members: Member[];
  saml_connections: SAMLConnection[];
  oidc_connections: OIDCConnection[];
};

const isValidEmail = (emailValue: string) => {
  // Overly simple email address regex
  const regex = /\S+@\S+\.\S+/;
  return regex.test(emailValue);
};

const isAdmin = (member: Member) => !!member.trusted_metadata!.admin;

const SSO_METHOD = {
  SAML: "SAML",
  OIDC: "OIDC",
};

const MemberRow = ({ member, user }: { member: Member; user: Member; }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isDisabled, setIsDisabled] = useState(false);
  const doDelete: MouseEventHandler = (e) => {
    e.preventDefault();
    setIsDisabled(true);
  //TODO: await deleteMember(member.member_id);
    // Force a reload to refresh the user list
    router.replace(pathname);
    // TODO: Success toast?
  };

  const canDelete =
    /* Do not let members delete themselves! */
    member.member_id !== user.member_id &&
    /* Only admins can delete! */
    isAdmin(user);

  const deleteButton = (
    <Button disabled={isDisabled} onClick={doDelete}>
      Delete User
    </Button>
  );

  return (
    <div className="flex items-center justify-between space-x-4">
      <div className="flex items-center space-x-4">
        <Avatar>
          <AvatarImage src="/avatars/03.png" />
          <AvatarFallback>OM</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium leading-none">
          {member.email_address} (
          {member.status})
          </p>
          <p className="text-sm text-muted-foreground">{isAdmin(member) ? "@admin" : "@member"}</p>
        </div>
      </div>
      
      {canDelete ? deleteButton : null}
    </div>
  );
};

const MemberList = ({
  members,
  user,
  org,
}: Pick<Props, "members" | "user" | "org">) => {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [isDisabled, setIsDisabled] = useState(true);

  useEffect(() => {
    setIsDisabled(!isValidEmail(email));
  }, [email]);

  const onInviteSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    // Disable button right away to prevent sending emails twice
    if (isDisabled) {
      return;
    } else {
      setIsDisabled(true);
    }
    //TODO: await invite(email);
    // Force a reload to refresh the user list
    router.replace(pathname);
  };

  return (
    <>
    <div className="space-y-4">
      <h4 className="text-sm font-medium">People with access</h4>
      <div className="grid gap-6">
        {members.map((member) => (
          <MemberRow key={member.member_id} member={member} user={user} />
        ))}
      </div>
    </div>
    <Separator className="my-4"/>
    <div className="space-y-4">
        <h3 className="text-sm font-medium">Invite new member</h3>
        <form onSubmit={onInviteSubmit} className="row">
          <Input
            placeholder={`your-coworker@${org.email_allowed_domains[0] ?? "example.com"
              }`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none  focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"                              
          />
          <Button disabled={isDisabled} type="submit">
            Invite
          </Button>
        </form>
      </div>
    </>
  );
};

const IDPList = ({
  user,
  saml_connections,
  oidc_connections,
}: Pick<Props, "user" | "saml_connections" | "oidc_connections">) => {
  const [idpNameSAML, setIdpNameSAML] = useState("");
  const [idpNameOIDC, setIdpNameOIDC] = useState("");
  const [ssoMethod, setSsoMethod] = useState(SSO_METHOD.SAML);
  const router = useRouter();
  const searchParams = useSearchParams();

  const onSamlCreate: FormEventHandler = (e) => {
    e.preventDefault();
    /*TODO const res = await createSamlSSOConn(idpNameSAML);
    if (res.status !== 200) {
      alert("Error creating connection");
      return;
    }
    const conn = await res.json();
    await router.push(
      `/${searchParams.get('slug')}/dashboard/saml/${conn.connection_id}`
    );*/
  };

  const onOidcCreate: FormEventHandler = (e) => {
    e.preventDefault();
    /*const res = await createOidcSSOConn(idpNameOIDC);
    if (res.status !== 200) {
      alert("Error creating connection");
      return;
    }
    const conn = await res.json();
    await router.push(
      `/${searchParams.get('slug')}/dashboard/oidc/${conn.connection_id}`
    );*/
  };

  return (
    <>
      <div className="section">
        <>
          <h2>SSO Connections</h2>
          <h3>SAML</h3>
          {saml_connections.length === 0 && <p>No connections configured.</p>}
          <ul>
            {saml_connections.map((conn) => (
              <li key={conn!.connection_id}>
                <Link
                  href={`/auth/${searchParams.get('slug')}/dashboard/saml/${conn!.connection_id}`}
                >
                  <span>
                    {conn!.display_name} ({conn!.status})
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <h3>OIDC</h3>
          {oidc_connections.length === 0 && <p>No connections configured.</p>}
          <ul>
            {oidc_connections.map((conn) => (
              <li key={conn!.connection_id}>
                <Link
                  href={`/auth/${searchParams.get('slug')}/dashboard/oidc/${conn!.connection_id}`}
                >
                  <span>
                    {conn!.display_name} ({conn!.status})
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      </div>

      {/*Only admins can create new SSO Connection*/}
      {isAdmin(user) && (
        <div className="section">
          <h3>Create a new SSO Connection</h3>
          <form
            onSubmit={
              ssoMethod === SSO_METHOD.SAML ? onSamlCreate : onOidcCreate
            }
            className="row"
          >
            <Input
              type="text"
              placeholder={
                ssoMethod === SSO_METHOD.SAML
                  ? `SAML Display Name`
                  : `OIDC Display Name`
              }
              value={ssoMethod === SSO_METHOD.SAML ? idpNameSAML : idpNameOIDC}
              onChange={
                ssoMethod === SSO_METHOD.SAML
                  ? (e) => setIdpNameSAML(e.target.value)
                  : (e) => setIdpNameOIDC(e.target.value)
              }
            />
            <button
              disabled={
                ssoMethod === SSO_METHOD.SAML
                  ? idpNameSAML.length < 3
                  : idpNameOIDC.length < 3
              }
              type="submit"
              className="primary"
            >
              Create
            </button>
          </form>
          <div className="radio-sso">
            <Input
              type="radio"
              id="saml"
              name="sso_method"
              onClick={(e) => setSsoMethod(SSO_METHOD.SAML)}
              checked={ssoMethod === SSO_METHOD.SAML}
            />
            <label htmlFor="saml">SAML</label>
            <Input
              type="radio"
              id="oidc"
              onClick={(e) => setSsoMethod(SSO_METHOD.OIDC)}
              checked={ssoMethod === SSO_METHOD.OIDC}
            />
            <label htmlFor="oidc">OIDC</label>
          </div>
        </div>
      )}
    </>
  );
};

{/*<div className="card ml-[200px] ">
      <p>
        MFA Setting: <span className="code">{org.mfa_policy}</span>
      </p>

      <IDPList
        user={user}
        saml_connections={saml_connections}
        oidc_connections={oidc_connections}
      />
      </div>
*/}

const DashboardClient = ({
    org,
    user,
    members,
    saml_connections,
    oidc_connections,
}: {
    org: Organization,
    user: Member,
    members: Member[],
    saml_connections: SAMLConnection[],
    oidc_connections: OIDCConnection[]
}) => {
  
  return (
    <div className="ml-[200px] p-10">
    <Card>
      <CardHeader>
        <CardTitle>Organization</CardTitle>
        <CardDescription>
          <div className="flex items-center">
            <CircleIcon className="mr-1 h-3 w-3 fill-yellow-600 text-yellow-400" />
            {org.organization_name}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <h4 className="text-sm font-medium mb-2">Connected user</h4>

        <div className="flex space-x-2">
          <Input value={`${user.email_address}`} readOnly />
          <Button variant="secondary" className="shrink-0">
            Copy
          </Button>
        </div>
        <Separator className="my-4" />
        <MemberList org={org} members={members} user={user} />
        <div className="pt-4">
        <Button>
          <Link href={"/auth/orgswitcher"}>
            Switch Organizations
          </Link>
        </Button>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <Button>
          <Link href={"/api/logout"}>
            Log Out
          </Link>
        </Button>
        
        </div>
      </CardContent>
    </Card>
    </div> 
  ); 
};


export default DashboardClient;
