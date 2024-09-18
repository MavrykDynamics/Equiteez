import { twMerge as twMergeOriginal } from 'tailwind-merge';
import clsx, { ClassValue } from 'clsx';

export const twMerge = (overrideClass: ClassValue, ...classes: ClassValue[]) =>
  twMergeOriginal(clsx(...classes), overrideClass as string);
