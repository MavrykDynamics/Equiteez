import { Button } from '~/atoms/Button';
import {
  ClickableDropdownArea,
  CustomDropdown,
  DropdownBodyContent,
  DropdownFaceContent,
} from '~/organisms/CustomDropdown/CustomDropdown';
import { useUserContext } from '~/providers/UserProvider/user.provider';

export const ConnectWallet = () => {
  const { connect, userAddress, signOut } = useUserContext();
  return userAddress ? (
    <div className="flex items-center gap-x-2">
      <CustomDropdown>
        <ClickableDropdownArea>
          <DropdownFaceContent>{userAddress}</DropdownFaceContent>
        </ClickableDropdownArea>
        <DropdownBodyContent position="right" topMargin={6} customWidth={203}>
          <Button variant="outline" size="outline" onClick={signOut}>
            Disconnect wallet
          </Button>
        </DropdownBodyContent>
      </CustomDropdown>
      <Button variant="outline" size="outline" onClick={signOut}>
        Disconnect wallet
      </Button>
    </div>
  ) : (
    <Button variant="outline" size="outline" onClick={connect}>
      <span className="text-body-xs leading-5 font-semibold">
        Connect Wallet
      </span>
    </Button>
  );
};
