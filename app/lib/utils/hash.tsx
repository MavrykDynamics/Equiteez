import type { ReactNode } from "react";

export type TrimHashOptions = {
  trim?: boolean;
  trimAfter?: number;
  firstCharsCount?: number;
  lastCharsCount?: number;
};

const DEFAULT_TRIM_AFTER = 20;
const DEFAULT_FIRST_CHARS_COUNT = 7;
const DEFAULT_LAST_CHARS_COUNT = 4;

export const getTrimmedHash = (
  hash: string,
  {
    trim = true,
    trimAfter = DEFAULT_TRIM_AFTER,
    firstCharsCount = DEFAULT_FIRST_CHARS_COUNT,
    lastCharsCount = DEFAULT_LAST_CHARS_COUNT,
  }: TrimHashOptions = {}
) => {
  if (!trim || hash.length <= trimAfter) {
    return hash;
  }

  return `${hash.slice(0, firstCharsCount)}...${hash.slice(
    hash.length - lastCharsCount,
    hash.length
  )}`;
};

export const renderTrimmedHash = (
  hash: string,
  {
    trim = true,
    trimAfter = DEFAULT_TRIM_AFTER,
    firstCharsCount = DEFAULT_FIRST_CHARS_COUNT,
    lastCharsCount = DEFAULT_LAST_CHARS_COUNT,
  }: TrimHashOptions = {}
): ReactNode => {
  if (!trim || hash.length <= trimAfter) {
    return hash;
  }

  return (
    <>
      {hash.slice(0, firstCharsCount)}
      <span className="opacity-75">...</span>
      {hash.slice(hash.length - lastCharsCount, hash.length)}
    </>
  );
};
