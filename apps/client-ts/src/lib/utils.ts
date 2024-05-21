import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toDomain(email: string): string {
  return email.split("@")[1];
}

export function formatISODate(ISOString: string): string {
  const date = new Date(ISOString);
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',  // "Monday"
    year: 'numeric',  // "2024"
    month: 'long',    // "April"
    day: 'numeric',   // "27"
    hour: '2-digit',  // "02"
    minute: '2-digit',  // "58"
    second: '2-digit',  // "59"
    timeZoneName: 'short'  // "GMT"
  };

  // Create a formatter (using US English locale as an example)
  const formatter = new Intl.DateTimeFormat('en-US', options);
  return formatter.format(date);
}


export function truncateMiddle(str: string, maxLength: number) {
  if (str.length <= maxLength) {
    return str;
  }

  const start = str.substring(0, maxLength / 2);
  const end = str.substring(str.length - maxLength / 2);
  return `${start}...${end}`;
}

export function insertDots(originalString: string): string {
  if(!originalString) return "";
  // if (originalString.length <= 50) {
  //   return originalString;
  // }
  return originalString.substring(0, 7) + '...';
}