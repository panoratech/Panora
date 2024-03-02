import {
    FormEventHandler,
    MouseEventHandler,
    useEffect,
    useState,
} from "react";  
import {
    Member,
    OIDCConnection,
    Organization,
    SAMLConnection,
} from "@/lib/stytch/loadStytch";
import { findAllMembers, findByID } from "@/lib/stytch/orgService";
import { list } from "@/lib/stytch/ssoService";
import { useAuth } from "@/context/authHooks";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useStytchCreateOidSSOConnMutation, useStytchCreateSamlSSOConnMutation, useStytchDeleteMemberMutation, useStytchInviteMutation } from "@/lib/stytch/api";
import config from "@/utils/config";

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
  
  const isAdmin = (member: Member) => member.trusted_metadata ? !!member.trusted_metadata.admin : false;
  
  const SSO_METHOD = {
    SAML: "SAML",
    OIDC: "OIDC",
  };
  
  const MemberRow = ({ member, user }: { member: Member; user: Member; }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const [isDisabled, setIsDisabled] = useState(false);
    const {mutate: deleteMember} = useStytchDeleteMemberMutation();
    const doDelete: MouseEventHandler = async (e) => {
      e.preventDefault();
      setIsDisabled(true);
      await deleteMember({member_id: member.member_id});
      // Force a reload to refresh the user list
      navigate(location.pathname + location.search, { replace: true });
      // TODO: Success toast?
    };
  
    const canDelete =
      /* Do not let members delete themselves! */
      member.member_id !== user.member_id &&
      /* Only admins can delete! */
      isAdmin(user);
  
    const deleteButton = (
      <button disabled={isDisabled} onClick={doDelete}>
        Delete User
      </button>
    );
  
    return (
      <li>
        [{isAdmin(member) ? "admin" : "member"}] {member.email_address} (
        {member.status}){/* Do not let members delete themselves! */}
        {canDelete ? deleteButton : null}
      </li>
    );
  };
  
  const MemberList = ({
    members,
    user,
    org,
  }: Pick<Props, "members" | "user" | "org">) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState("");
    const [isDisabled, setIsDisabled] = useState(true);
    const {mutate: invite} = useStytchInviteMutation();

    useEffect(() => {
      setIsDisabled(!isValidEmail(email));
    }, [email]);
  
    const onInviteSubmit: FormEventHandler = async (e) => {
      e.preventDefault();
      // Disable button right away to prevent sending emails twice
      if (isDisabled) {
        return;
      } else {
        setIsDisabled(true);
      }
      await invite({email});
      // Force a reload to refresh the user list
      navigate(location.pathname + location.search, { replace: true });
    };
  
    return (
      <>
        <div className="section">
          <h2>Members</h2>
          <ul>
            {members.map((member) => (
              <MemberRow key={member.member_id} member={member} user={user} />
            ))}
          </ul>
        </div>
  
        <div className="section">
          <h3>Invite new member</h3>
          <form onSubmit={onInviteSubmit} className="row">
            <input
              placeholder={`your-coworker@${org.email_allowed_domains[0] ?? "example.com"
                }`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
            />
            <button className="primary" disabled={isDisabled} type="submit">
              Invite
            </button>
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
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const slug = queryParams.get('slug'); 
    
    const {mutate: create} = useStytchCreateSamlSSOConnMutation();
  
    const onSamlCreate: FormEventHandler = async (e) => {
      e.preventDefault();
      try{
        const res = create({display_name: idpNameSAML});
        navigate(
          `/${slug}/dashboard/saml/${res.connection_id}`
        );
      }catch(error){
        alert("Error creating connection");
        return;
      }
    };

    const {mutate: createOidSSO} = useStytchCreateOidSSOConnMutation();

  
    const onOidcCreate: FormEventHandler = async (e) => {
      e.preventDefault();
      try{
        const res = createOidSSO({display_name: idpNameOIDC});
        navigate(
            `/${slug}/dashboard/oidc/${res.connection_id}`
          );
      }catch(error){
        alert("Error creating connection");
        return;
      }
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
                <li key={conn?.connection_id}>
                  <Link
                    to={`/${slug}/dashboard/saml/${conn?.connection_id}`}
                  >
                    <span>
                      {conn?.display_name} ({conn?.status})
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <h3>OIDC</h3>
            {oidc_connections.length === 0 && <p>No connections configured.</p>}
            <ul>
              {oidc_connections.map((conn) => (
                <li key={conn?.connection_id}>
                  <Link
                    to={`/${slug}/dashboard/oidc/${conn?.connection_id}`}
                  >
                    <span>
                      {conn?.display_name} ({conn?.status})
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
              <input
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
              <input
                type="radio"
                id="saml"
                name="sso_method"
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                onClick={(e) => setSsoMethod(SSO_METHOD.SAML)}
                checked={ssoMethod === SSO_METHOD.SAML}
              />
              <label htmlFor="saml">SAML</label>
              <input
                type="radio"
                id="oidc"
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  
  const Dashboard = async () => {
    const { user: member, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    if(!isAuthenticated) {
        navigate('/login')
        return;
    }
    const org = await findByID(member!.organization_id);

    if (org === null) {
    return { redirect: { statusCode: 307, destination: `/login` } };
    }

    const [members, ssoConnections] = await Promise.all([
        findAllMembers(org.organization_id),
        list(org.organization_id),""
    ]);

    return (
      <div className="card">
        <h1>Organization name: {org.organization_name}</h1>
        <p>
          Organization slug: <span className="code">{org.organization_slug}</span>
        </p>
        <p>
          Current user: <span className="code">{member!.email_address}</span>
        </p>
        <p>
          MFA Setting: <span className="code">{org.mfa_policy}</span>
        </p>
        <MemberList org={org} members={members} user={member!} />
        <br />
        <IDPList
          user={member!}
          saml_connections={ssoConnections.saml_connections ?? []}
          oidc_connections={ssoConnections.oidc_connections ?? []}
        />
  
        <div>
          <Link to={"/orgswitcher"}>Switch Organizations</Link>
          &nbsp;&nbsp;&nbsp;&nbsp;
          <Link to={`${config.API_URL}/auth/stytch/logout`}>Log Out</Link> 
        </div>
      </div>
    );
  };
  
  export default Dashboard;
  