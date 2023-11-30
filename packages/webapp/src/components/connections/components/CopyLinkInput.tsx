import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import React, { useState } from 'react';

const CopyLinkInput = () => {
  const [value, setValue] = useState('https://magic-link/edfr-12h3KKHjdd-1.com');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <>
      <Input
        defaultValue={value}
        readOnly
        className="col-span-3"
      />
      <Button
        onClick={handleCopy}
        variant="outline"
        className=" text-white rounded-md" // Adjust the styling as needed
      >
        {copied ? 'Copied!' : 'Copy'}
      </Button>
    </>
  );
};

export default CopyLinkInput;
