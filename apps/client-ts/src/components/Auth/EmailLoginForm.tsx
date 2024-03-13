'use client'
import { FormEventHandler, useEffect, useState } from "react";
import { Input } from "@/components/ui/input"
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import Link from "next/link";
import { Card } from "../ui/card";

const STATUS = {
  INIT: 0,
  SENT: 1,
  ERROR: 2,
};

const isValidEmail = (emailValue: string) => {
  // Overly simple email address regex
  const regex = /\S+@\S+\.\S+/;
  return regex.test(emailValue);
};

type EmailLoginProps = React.PropsWithChildren<{
  title: string;
  onSubmit: (email: string) => Promise<{ status: number; }>;
}>;
export const EmailLoginForm = ({ title, onSubmit, children }: EmailLoginProps) => {
  const [emlSent, setEMLSent] = useState(STATUS.INIT);
  const [email, setEmail] = useState("");
  const [isDisabled, setIsDisabled] = useState(true);

  useEffect(() => {
    setIsDisabled(!isValidEmail(email));
  }, [email]);

  const onSubmitFormHandler: FormEventHandler = async (e) => {
    e.preventDefault();
    // Disable button right away to prevent sending emails twice
    if (isDisabled) {
      return;
    } else {
      setIsDisabled(true);
    }

    if (isValidEmail(email)) {
      const resp = await onSubmit(email);
      if (resp.status === 200) {
        setEMLSent(STATUS.SENT);
      } else {
        setEMLSent(STATUS.ERROR);
      }
    }
  };

  const handleTryAgain = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setEMLSent(STATUS.INIT);
  };

  return (
    <Card className="p-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      {emlSent === STATUS.INIT && children}
      {emlSent === STATUS.INIT && (
        <div className="section">
          <form onSubmit={onSubmitFormHandler}>
            <Input
              name="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="mt-4"
            />
            <Button
              className="primary"
              disabled={isDisabled}
              id="button"
              type="submit"
            >
              Continue
            </Button>
          </form>
        </div>
      )}
      {emlSent === STATUS.SENT && (
        <div className="section">
          <Badge className="mb-2" variant={'outline'}>          
            <h2 className="text-md font-semibold">Check your email</h2>
          </Badge>
          <Badge className="mb-2" variant={'outline'}>          
          <p className="text-md font-semibold">{`An email was sent to ${email}`}</p>
          </Badge>
          <div>
            <Link href="" className="link underline text-md font-semibold" onClick={handleTryAgain}>
              Click here to try again.
            </Link>
          </div>
          
        </div>
      )}
      {emlSent === STATUS.ERROR && (
        <div className="text-md font-semibold">
          <h2>Something went wrong!</h2>
          <p>{`Failed to send email to ${email}`}</p>
          <a className="link underline" onClick={handleTryAgain}>
            Click here to try again.
          </a>
        </div>
      )}
    </Card>
  );
};
