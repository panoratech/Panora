import { Input } from "@/components/ui/input"

type SMSProps = React.PropsWithChildren<{
  memberID: string,
  orgID: string,
}>;
export const SMSAuthenticateForm = ({ memberID, orgID }: SMSProps) => {
  return (
    <form method="POST" action="/api/smsmfa/authenticate" className="row">
      Please enter the one-time code sent to your phone number
      <Input
        type={"text"}
        placeholder={`Code`}
        name="code"
      />
      <Input type="hidden" name="orgID" value={orgID} />
      <Input type="hidden" name="memberID" value={memberID} />
      <button type="submit" className="primary">
        Authenticate
      </button>
    </form>
  );
};
