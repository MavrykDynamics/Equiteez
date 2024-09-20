import { Link } from '@remix-run/react';

export const popupOperationError = () => ({
  icon: <div className="mx-auto w-16 h-16 text-[64px] leading-[64px]">‼️</div>,
  title: 'Transaction Failed',
  body: (
    <span>
      Please double check your balances and available tokens and try again. If
      it fails again, please reach out to support{' '}
      <Link to="/" className="underline">
        here
      </Link>
      .
    </span>
  ),
});

export const popupOperationSuccess = (tokenName: string) => ({
  icon: <div className="mx-auto w-16 h-16 text-[64px] leading-[64px]">🎉</div>,
  title: 'Congratulations!',
  body: (
    <span>
      You are now an investor in {tokenName}. You can view your tokens in the{' '}
      <Link to="/" className="underline">
        dashboard
      </Link>
      .
    </span>
  ),
});
