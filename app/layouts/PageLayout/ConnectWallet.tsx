import clsx from 'clsx';
import { Button } from '~/lib/atoms/Button';
import { HashShortView } from '~/lib/atoms/HashShortView';
import {
  ClickableDropdownArea,
  CustomDropdown,
  DropdownBodyContent,
  DropdownFaceContent,
} from '~/lib/organisms/CustomDropdown/CustomDropdown';
import IdentIcon from '~/lib/organisms/IdenIcon';
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
              <DropdownFaceContent
                className={clsx(
                  'py-[2px] border-2 border-dark-green-50 pl-2 pr-3 rounded-4xl ',
                  'hover:bg-dark-green-opacity hover:border-dark-green-500',
                  'focus:border-dark-green-500 focus:bg-transparent',
                  'transition duration-250 ease-in-out'
                )}
              >
                <div className="flex items-center">
                  <IdentIcon
                    type="bottts"
                    size={32}
                    className="mr-2"
                    hash={userAddress}
                  />
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
                className="bg-background text-content text-body-xs py-3 px-4 text-left w-full hover:bg-dark-green-opacity"
                onClick={changeUser}
              >
                Change account
              </button>
              <button
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
          <Button size="small-plus" className="px-8 py-[10px]" disabled>
            <span className="text-body-xs leading-5  font-bold">Sign Up</span>
          </Button>
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
