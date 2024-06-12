import { FC, HTMLAttributes, useMemo } from 'react';
import classNames from 'clsx';

import useCopyToClipboard from '~/lib/ui/useCopyToClipboard';
import useTippy from '~/lib/ui/useTippy';

export type CopyButtonProps = HTMLAttributes<HTMLButtonElement> & {
  rounded?: 'sm' | 'base';
  text: string;
  small?: boolean;
  type?: 'button' | 'link' | 'block';
};

export const CopyButton: FC<CopyButtonProps> = ({
  children,
  text,
  small = false,
  className,
  type = 'button',
  rounded = 'sm',
  ...rest
}) => {
  const { fieldRef, copy, copied, setCopied } = useCopyToClipboard();

  const tippyProps = useMemo(
    () => ({
      trigger: 'mouseenter',
      hideOnClick: false,
      content: copied ? 'Copied!' : 'Copy',
      animation: 'shift-away-subtle',
      onHidden() {
        setCopied(false);
      },
    }),
    [copied, setCopied]
  );

  const buttonRef = useTippy<HTMLButtonElement>(tippyProps);

  const handleCopyPress = () => {
    return copy();
  };

  const classNameMemo = useMemo(
    () =>
      type === 'button'
        ? classNames(
            'font-tnum leading-none select-none text-links',
            'transition ease-in-out duration-300',
            rounded === 'base' ? 'rounded' : 'rounded-sm',
            small ? 'text-body-xs' : 'text-body',
            className
          )
        : type === 'block'
        ? classNames(className)
        : classNames('hover:underline', className),
    [type, className, rounded, small]
  );

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={classNameMemo}
        {...rest}
        onClick={handleCopyPress}
      >
        {children}
      </button>

      <input ref={fieldRef} value={text} readOnly className="sr-only" />
    </>
  );
};
