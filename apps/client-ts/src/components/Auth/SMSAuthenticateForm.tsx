type SMSProps = React.PropsWithChildren<{
  memberID: string,
  orgID: string,
}>;
export const SMSAuthenticateForm = ({ memberID, orgID }: SMSProps) => {
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
