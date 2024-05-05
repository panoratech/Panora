import { ReactNode } from "react";

interface HeadingProps {
    title: string;
    description: ReactNode;
}

export const CustomHeading: React.FC<HeadingProps> = ({ title, description }) => {
    return (
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    );
  };
  