import {SMSSendForm} from "@/components/Auth/SMSSendForm";
import {useRouter} from "next/navigation";
import {SMSAuthenticateForm} from "@/components/Auth/SMSAuthenticateForm";

const App = () => {
  const router = useRouter();
  const orgID = router.query.org_id as string;
  const memberID = router.query.member_id as string;
  const sent = router.query.sent as string;

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
