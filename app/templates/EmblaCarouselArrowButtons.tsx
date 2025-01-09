/* eslint-disable react/prop-types */
import React, { PropsWithChildren } from "react";

// icons
import ArrowRight from "app/icons/chevron-right.svg?react";
import ArrowLeft from "app/icons/chevron-left.svg?react";
import clsx from "clsx";

type PropType = PropsWithChildren<
  React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >
> & { colorClassName?: string };

export const PrevButton: React.FC<PropType> = (props) => {
  const { children, disabled, colorClassName, ...restProps } = props;

  return (
    <button
      className={clsx(
        colorClassName,
        "rounded-full overflow-hidden border-2 border-current w-11 h-11 flex items-center justify-center",
        disabled && "opacity-50 pointer-events-none"
      )}
      type="button"
      {...restProps}
    >
      <ArrowLeft className=" stroke-current w-6 h-6" />
      {children}
    </button>
  );
};

export const NextButton: React.FC<PropType> = (props) => {
  const { children, disabled, colorClassName, ...restProps } = props;

  return (
    <button
      className={clsx(
        colorClassName,
        " rounded-full overflow-hidden border-2 border-current w-11 h-11 flex items-center justify-center",
        disabled && "opacity-50 pointer-events-none"
      )}
      type="button"
      {...restProps}
    >
      <ArrowRight className=" stroke-current w-6 h-6" />
      {children}
    </button>
  );
};
