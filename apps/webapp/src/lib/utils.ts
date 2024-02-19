import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { NumberParam, withDefault } from 'use-query-params';


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function NumberParamWithDefault(num: number) {
  return withDefault(NumberParam, num);
}