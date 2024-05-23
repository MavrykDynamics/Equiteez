import { Button } from '~/atoms/Button';
import { useUserContext } from '~/providers/UserProvider/user.provider';

export const ConnectWallet = () => {
  const { connect, userAddress, signOut } = useUserContext();
  return userAddress ? (
    <div className="flex items-center gap-x-2">
      <h5 className="text-body-xs text-green-main">{userAddress}</h5>
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
