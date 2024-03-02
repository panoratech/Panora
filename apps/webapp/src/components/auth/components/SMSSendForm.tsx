type SMSProps = React.PropsWithChildren<{
  memberID: string,
  orgID: string,
}>;
export const SMSSendForm = ({ memberID, orgID }: SMSProps) => {
  return (
    <form method="POST" action="/api/smsmfa/send" className="row">
      Please enter your phone number
      <input
        type={"text"}
        placeholder={`Phone Number`}
        name="phone_number"
      />
      <input type="hidden" name="orgID" value={orgID} />
      <input type="hidden" name="memberID" value={memberID} />
      <button type="submit" className="primary">
        Send
      </button>
    </form>
  );
};
