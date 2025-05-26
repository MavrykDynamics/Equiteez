import { Link } from "@remix-run/react";

export const popupOperationError = () => ({
  icon: <div className="mx-auto w-16 h-16 text-[52px] leading-[52px]">‼️</div>,
  title: "Transaction Failed",
  body: (
    <span>
      Please double check your balances and available tokens and try again. If
      it fails again, please reach out to support{" "}
      <Link to="/" className="underline">
        here
      </Link>
      .
    </span>
  ),
});

export const popupRwaBuyOperationSuccess = (tokenName: string) => ({
  icon: <div className="mx-auto w-16 h-16 text-[52px] leading-[52px]">🎉</div>,
  title: "Congratulations!",
  body: (
    <span>
      You are now an investor in{" "}
      <span className="font-semibold">{tokenName}</span>.<br /> You can view
      your assets in your{" "}
      <a
        href="https://chromewebstore.google.com/detail/mavryk-wallet/cgddkajmbckbjbnondgfcbcojjjdnmji"
        target="_blank"
        rel="noreferrer"
        className="underline text-blue-500 font-bold"
      >
        Mavryk Wallet
      </a>
      .
    </span>
  ),
});

export const popupRwaSellOperationSuccess = (tokenName: string) => ({
  icon: <div className="mx-auto w-16 h-16 text-[52px] leading-[52px]">✅</div>,
  title: "Sale Completed!",
  body: (
    <span>
      You have successfully sold your assets of{" "}
      <span className="font-semibold">{tokenName}</span>.<br /> You can view
      your funds in the dashboard.
    </span>
  ),
});
