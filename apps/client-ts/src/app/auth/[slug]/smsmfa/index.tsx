import {SMSSendForm} from "@/components/Auth/SMSSendForm";
import {useSearchParams} from "next/navigation";
import {SMSAuthenticateForm} from "@/components/Auth/SMSAuthenticateForm";

const App = () => {
  const searchParams = useSearchParams();
  const orgID = searchParams.get('org_id') as string;
  const memberID = searchParams.get('member_id') as string;
  const sent = searchParams.get('sent') as string;

  const Component = sent === "true" ? SMSAuthenticateForm : SMSSendForm;
  return (
    <div className="card">
      <Component
        orgID={orgID}
        memberID={memberID}
      />
    </div>
  )
};

export default App;
