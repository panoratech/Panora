import React from "react"

type SMSProps = React.PropsWithChildren<{
  memberID: string,
  orgID: string,
}>;

export const SMSAuthenticateForm = ({ memberID, orgID }: SMSProps) => {
  // Use your custom hook
  const { mutate } = useStytch();

  // Form submit handler
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent traditional form submission
    mutate({ organization_name: orgName, require_mfa: requireMFA });
  };
  return (
    <form method="POST" action="/api/smsmfa/authenticate" className="row">
      Please enter the one-time code sent to your phone number
      <input
        type={"text"}
        placeholder={`Code`}
        name="code"
      />
      <input type="hidden" name="orgID" value={orgID} />
      <input type="hidden" name="memberID" value={memberID} />
      <button type="submit" className="primary">
        Authenticate
      </button>
    </form>
  );
};
