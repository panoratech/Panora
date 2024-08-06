import { Input } from "@/components/ui/input"

type SMSProps = React.PropsWithChildren<{
  memberID: string,
  orgID: string,
}>;
export const SMSSendForm = ({ memberID, orgID }: SMSProps) => {
  return (
    <form method="POST" action="/api/smsmfa/send" className="row">
      Please enter your phone number
      <Input
        type={"text"}
        placeholder={`Phone Number`}
        name="phone_number"
      />
      <Input type="hidden" name="orgID" value={orgID} />
      <Input type="hidden" name="memberID" value={memberID} />
      <button type="submit" className="primary">
        Send
      </button>
    </form>
  );
};
