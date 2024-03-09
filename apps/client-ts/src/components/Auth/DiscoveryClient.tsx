'use client';

import { useState } from "react";

/*const CreateNewOrganization = () => {
  const [orgName, setOrgName] = useState("");
  const [requireMFA, setRequireMFA] = useState(false);
  return (
    <div className="section">
      <h3>Or, create a new Organization</h3>

      <form method="POST" action="/api/discovery/create" className="row">
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
};*/


const DiscoveryClient = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return (
    <div className="card">
      {children}
      {/*<CreateNewOrganization />*/}
    </div>
  );
};

export default DiscoveryClient;
