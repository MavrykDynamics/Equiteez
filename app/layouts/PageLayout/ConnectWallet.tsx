import { Button } from '~/atoms/Button';
import { HashShortView } from '~/atoms/HashShortView';
import {
  ClickableDropdownArea,
  CustomDropdown,
  DropdownBodyContent,
  DropdownFaceContent,
} from '~/organisms/CustomDropdown/CustomDropdown';
import { IdentIcon } from '~/organisms/IdenIcon';
import { useUserContext } from '~/providers/UserProvider/user.provider';
import { CustomSuspense } from '~/templates/CustomSuspense';

export const ConnectWallet = () => {
  const { connect, userAddress, signOut, isLoading, changeUser } =
    useUserContext();
  return (
    <CustomSuspense loading={isLoading}>
      {userAddress ? (
        <div className="flex items-center gap-x-2">
          <CustomDropdown>
            <ClickableDropdownArea>
              <DropdownFaceContent>
                <div className="flex items-center">
                  <IdentIcon hash={userAddress} size={32} className="mr-2" />
                  <div className="text-caption-regular text-content">
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
              <button
                className="bg-background text-content text-body-xs py-3 px-4 text-left w-full hover:bg-green-opacity"
                onClick={changeUser}
              >
                Change account
              </button>
              <button
                className="bg-background text-content text-body-xs py-3 px-4 text-left w-full hover:bg-green-opacity"
                onClick={signOut}
              >
                Disconnect
              </button>
            </DropdownBodyContent>
          </CustomDropdown>
        </div>
      ) : (
        <Button variant="outline" size="outline" onClick={connect}>
          <span className="text-body-xs leading-5 font-semibold">
            Connect Wallet
          </span>
        </Button>
      )}
    </CustomSuspense>
  );
};
