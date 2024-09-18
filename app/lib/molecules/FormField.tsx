import React, {
  forwardRef,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';

import classNames, { clsx } from 'clsx';

import CleanButton from 'app/lib/atoms/CleanButton';
import CopyIcon from 'app/icons/copy.svg?react';
import { useDidUpdate } from 'app/lib/ui/hooks';
import {
  blurHandler,
  focusHandler,
  inputChangeHandler,
} from 'app/lib/ui/inputHandlers';
import { useBlurElementOnTimeout } from 'app/lib/ui/use-blur-on-timeout';
import useCopyToClipboard from 'app/lib/ui/useCopyToClipboard';
import { combineRefs } from 'app/lib/ui/utils';

import { FieldLabel } from 'app/lib/atoms/FieldLabel';
import { SecretCover } from 'app/lib/atoms/SecretCover';
import { CopyButton } from '../atoms/CopyButton';
import usePasswordToggle from '../ui/hooks/usePasswordToggle';

export const PASSWORD_ERROR_CAPTION = 'PASSWORD_ERROR_CAPTION';

export type FormFieldElement = HTMLInputElement | HTMLTextAreaElement;
type FormFieldAttrs = InputHTMLAttributes<HTMLInputElement> &
  TextareaHTMLAttributes<HTMLTextAreaElement>;

export interface FormFieldProps
  extends Omit<FormFieldAttrs, 'type' | 'onBlur'> {
  type?: 'text' | 'number' | 'password';
  extraSection?: ReactNode;
  label?: ReactNode;
  labelDescription?: ReactNode;
  labelWarning?: ReactNode;
  errorCaption?: ReactNode;
  childForInputWrapper?: ReactNode;
  containerClassName?: string;
  containerStyle?: React.CSSProperties;
  textarea?: boolean;
  /** `textarea=true` only */
  secret?: boolean;
  /** `type='password'` only */
  revealForbidden?: boolean;
  /**
   * Any value, whose change will result in password un-reveal.
   * `type='password'` only
   */
  revealRef?: unknown;
  cleanable?: boolean;
  onClean?: EmptyFn;
  onReveal?: EmptyFn;
  onBlur?: React.FocusEventHandler;
  smallPaddings?: boolean;
  labelClassname?: string;
  copyable?: boolean;
  testIDs?: {
    inputSection?: string;
    input?: string;
  };
}

/**
 * TODO: Consider separating into two: `FormInputField` & `FormTextAreaField`
 */
// eslint-disable-next-line react/display-name
export const FormField = forwardRef<FormFieldElement, FormFieldProps>(
  (
    {
      containerStyle,
      extraSection,
      label,
      labelDescription,
      labelWarning,
      errorCaption,
      containerClassName,
      textarea,
      secret: secretProp,
      revealForbidden = false,
      revealRef,
      cleanable,
      id,
      type,
      value,
      defaultValue,
      onChange,
      onFocus,
      onBlur,
      onClean,
      onReveal,
      className,
      spellCheck = false,
      autoComplete = 'off',
      smallPaddings = false,
      copyable,
      childForInputWrapper,
      labelClassname,
      ...rest
    },
    ref
  ) => {
    const secret = secretProp && textarea;
    const Field = textarea ? 'textarea' : 'input';

    const [passwordInputType, RevealPasswordIcon] = usePasswordToggle(
      smallPaddings,
      id,
      onReveal,
      revealRef,
      onBlur
    );
    const isPasswordInput = type === 'password';
    const inputType = isPasswordInput ? passwordInputType : type;

    const { copy } = useCopyToClipboard();

    const [localValue, setLocalValue] = useState(value ?? defaultValue ?? '');
    useDidUpdate(() => void setLocalValue(value ?? ''), [value]);

    const [focused, setFocused] = useState(false);

    const handleChange = useCallback(
      (e: React.ChangeEvent<FormFieldElement>) => {
        inputChangeHandler(e, onChange, setLocalValue);
      },
      [onChange, setLocalValue]
    );

    const handleFocus = useCallback(
      (e: React.FocusEvent) => focusHandler(e, onFocus, setFocused),
      [onFocus, setFocused]
    );
    const handleBlur = useCallback(
      (e: React.FocusEvent) => blurHandler(e, onBlur, setFocused),
      [onBlur, setFocused]
    );

    const secretCovered = useMemo(
      () => Boolean(secret && localValue !== '' && !focused),
      [secret, localValue, focused]
    );

    const spareRef = useRef<FormFieldElement>();

    useBlurElementOnTimeout(
      spareRef,
      focused && Boolean(secret || isPasswordInput)
    );

    const handleSecretBannerClick = () => void spareRef.current?.focus();
    const handleCleanClick = useCallback(() => void onClean?.(), [onClean]);

    const showIcon = isPasswordInput && !revealForbidden && localValue !== '';

    return (
      <div
        className={classNames('w-full flex flex-col', containerClassName)}
        style={containerStyle}
      >
        {label && (
          <FieldLabel
            label={label}
            warning={labelWarning}
            description={labelDescription}
            className={clsx('mb-3', labelClassname)}
            id={id}
          />
        )}

        <div
          className={classNames('relative flex items-stretch overflow-hidden')}
        >
          <Field
            ref={combineRefs(ref, spareRef)}
            className={clsx(
              className,
              FORM_FIELD_CLASS_NAME,
              smallPaddings ? 'py-2 pl-2' : 'py-3 pl-4',
              buildPaddingRightClassName(
                isPasswordInput,
                smallPaddings,
                showIcon
              ),
              errorCaption ? 'border-error' : 'border-gray-100'
            )}
            id={id}
            type={inputType}
            value={value}
            defaultValue={defaultValue}
            spellCheck={spellCheck}
            autoComplete={autoComplete}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...rest}
          />
          {extraSection}
          {showIcon && RevealPasswordIcon}
          {childForInputWrapper}
          {secretCovered && <SecretCover onClick={handleSecretBannerClick} />}
          <Cleanable
            cleanable={cleanable}
            handleCleanClick={handleCleanClick}
          />
          <Copyable
            value={value}
            copy={copy}
            cleanable={cleanable}
            copyable={copyable}
          />
        </div>

        <ErrorCaption errorCaption={errorCaption} />
      </div>
    );
  }
);

export const FORM_FIELD_CLASS_NAME = classNames(
  'appearance-none w-full border rounded-md bg-transparent',
  'transition ease-in-out duration-200',
  'text-sand-600 text-base-plus'
);

interface CleanableProps {
  handleCleanClick: () => void;
  cleanable: React.ReactNode;
}

const Cleanable: React.FC<CleanableProps> = ({ cleanable, handleCleanClick }) =>
  cleanable ? <CleanButton onClick={handleCleanClick} /> : null;

interface CopyableProps {
  value: React.ReactNode;
  copy: () => void;
  cleanable: React.ReactNode;
  copyable: React.ReactNode;
}

const Copyable: React.FC<CopyableProps> = ({
  copy,
  cleanable,
  value,
  copyable,
}) =>
  copyable ? (
    <CopyButton
      style={{
        position: 'absolute',
        bottom: cleanable ? '3px' : '0px',
        right: cleanable ? '30px' : '5px',
      }}
      text={value as string}
      type="link"
    >
      <CopyIcon
        style={{ verticalAlign: 'inherit' }}
        className="h-4 ml-1 w-auto inline text-blue-200 fill-current"
        onClick={() => copy()}
      />
    </CopyButton>
  ) : null;

interface ErrorCaptionProps {
  errorCaption: React.ReactNode;
}

const ErrorCaption: React.FC<ErrorCaptionProps> = ({ errorCaption }) => {
  const isPasswordStrengthIndicator = errorCaption === PASSWORD_ERROR_CAPTION;

  return errorCaption && !isPasswordStrengthIndicator ? (
    <div className="text-sm text-error mt-1">{errorCaption}</div>
  ) : null;
};

const buildPaddingRightClassName = (
  isPasswordInput: boolean,
  withExtraInner: boolean,
  smallPaddings: boolean,
  showIcon = false
) => {
  if (withExtraInner) return 'pr-32';

  if (!showIcon) return 'pr-4';

  if (isPasswordInput) return smallPaddings ? 'pr-9' : 'pr-12';

  return smallPaddings ? 'pr-2' : 'pr-4';
};
