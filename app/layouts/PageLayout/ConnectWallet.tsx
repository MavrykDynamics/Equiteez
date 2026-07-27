import clsx from "clsx";
import { useCallback, useState } from "react";
import { Button } from "~/lib/atoms/Button";
import { HashShortView } from "~/lib/atoms/HashShortView";
import {
  ClickableDropdownArea,
  CustomDropdown,
  DropdownBodyContent,
  DropdownFaceContent,
} from "~/lib/organisms/CustomDropdown/CustomDropdown";
import IdentIcon from "~/lib/organisms/IdenIcon";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import { useWalletContext } from "~/providers/WalletProvider/wallet.provider";
import { CustomSuspense } from "~/templates/CustomSuspense";
import { Link } from "@remix-run/react";
import { ROUTES } from "~/consts/routes";
import styles from "./ConnectWallet.module.css";
import { Icon } from "~/lib/atoms/Icon";
import { useToasterContext } from "~/providers/ToasterProvider/toaster.provider";

export const ConnectWallet = () => {
  const { connect, userAddress, signOut, isLoading, changeUser } =
    useUserContext();
  const { dapp } = useWalletContext();
  const { bug, success, warning } = useToasterContext();
  const [isSecurityProbeSending, setIsSecurityProbeSending] = useState(false);

  const handleSecurityProbeRequest = useCallback(async () => {
    if (!dapp || !userAddress) {
      warning(
        "Security probe unavailable",
        "Connect a wallet before sending the invalid security probe."
      );
      return;
    }

    setIsSecurityProbeSending(true);

    try {
      await dapp.requestRejectedSecurityProbe(userAddress);
      bug(
        "The wallet accepted a source-spoofed operation request. Treat this as a failed security check.",
        "Security probe not blocked"
      );
    } catch (error) {
      console.info("Security probe rejected by wallet extension:", error);
      success(
        "Security probe blocked",
        "The wallet rejected the invalid source-spoofed operation request."
      );
    } finally {
      setIsSecurityProbeSending(false);
    }
  }, [bug, dapp, success, userAddress, warning]);

  return (
    <CustomSuspense loading={isLoading}>
      {userAddress ? (
        <div className="flex items-center gap-x-2">
          <CustomDropdown>
            <ClickableDropdownArea>
              <DropdownFaceContent
                className={clsx(
                  "p-[4px] pr-[8px] border-2 border-dark-green-50 rounded-4xl ",
                  "hover:bg-dark-green-opacity hover:border-dark-green-500",
                  "focus:border-dark-green-500 focus:bg-transparent",
                  "transition duration-250 ease-in-out",
                  styles.dropdown
                )}
              >
                <div className="flex items-center">
                  <IdentIcon
                    type="bottts"
                    size={32}
                    className={clsx(styles.identIcon, "mr-2")}
                    hash={userAddress}
                  />
                  <Icon icon="account" className={styles.accountIcon} />
                  <div
                    className={clsx(
                      styles.hashShortView,
                      "text-caption-regular text-content font-semibold"
                    )}
                  >
                    <HashShortView hash={userAddress} />
                  </div>
                </div>
              </DropdownFaceContent>
            </ClickableDropdownArea>
            <DropdownBodyContent
              position="right"
              topMargin={16}
              customWidth={203}
            >
              <Link
                to={ROUTES.wallet}
                className="bg-background block text-content text-body-xs py-3 px-4 text-left w-full hover:bg-dark-green-opacity"
              >
                Profile dashboard
              </Link>
              <button
                type="button"
                className="bg-background text-content text-body-xs py-3 px-4 text-left w-full hover:bg-dark-green-opacity"
                onClick={changeUser}
              >
                Change account
              </button>
              <button
                type="button"
                className="bg-background text-content text-body-xs py-3 px-4 text-left w-full hover:bg-dark-green-opacity disabled:opacity-50"
                disabled={isSecurityProbeSending}
                onClick={handleSecurityProbeRequest}
              >
                {isSecurityProbeSending
                  ? "Sending probe..."
                  : "Security reject test"}
              </button>
              <button
                type="button"
                className="bg-background text-content text-body-xs py-3 px-4 text-left w-full hover:bg-dark-green-opacity"
                onClick={signOut}
              >
                Sign Out
              </button>
            </DropdownBodyContent>
          </CustomDropdown>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {/*<Button size="small-plus" className="px-8 py-[10px]" disabled>*/}
          {/*  <span className="text-body-xs leading-5  font-bold">Sign Up</span>*/}
          {/*</Button>*/}
          <Button
            variant="outline"
            size="outline"
            className="px-8 py-[10px]"
            onClick={connect}
          >
            <span className="text-body-xs leading-5 font-bold">Login</span>
          </Button>
        </div>
      )}
    </CustomSuspense>
  );
};
