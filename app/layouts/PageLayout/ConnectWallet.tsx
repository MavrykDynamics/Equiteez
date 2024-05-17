import { Button } from '~/atoms/Button';
import { useUserContext } from '~/providers/UserProvider/user.provider';

export const ConnectWallet = () => {
  const { connect, userAddress } = useUserContext();
  return (
    <Button variant="outline" size="outline" onClick={connect}>
      {userAddress ? userAddress : 'Connect Wallet'}
    </Button>
  );
};
