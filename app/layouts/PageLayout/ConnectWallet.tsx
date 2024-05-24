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

export const ConnectWallet = () => {
  const { connect, userAddress, signOut } = useUserContext();
  return userAddress ? (
    <div className="flex items-center gap-x-2">
      <CustomDropdown>
        <ClickableDropdownArea>
          <DropdownFaceContent>
            <div className="flex items-center">
              <IdentIcon hash={userAddress} size={32} className="mr-2" />
              <HashShortView hash={userAddress} />
            </div>
          </DropdownFaceContent>
        </ClickableDropdownArea>
        <DropdownBodyContent position="right" topMargin={6} customWidth={203}>
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
  );
};
