import React from 'react';
import {SMSSendForm} from "./../../components/SMSSendForm";
import {SMSAuthenticateForm} from "./../../components/SMSAuthenticateForm";

import { useLocation } from 'react-router-dom';

const App = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const orgID = queryParams.get('org_id'); 
  const memberID = queryParams.get('member_id'); 
  const sent = queryParams.get('sent'); 

  const Component = sent === "true" ? SMSAuthenticateForm : SMSSendForm;
  return (
    <div className="card">
      <Component
        orgID={orgID!}
        memberID={memberID!}
      />
    </div>
  )
};

export default App;
