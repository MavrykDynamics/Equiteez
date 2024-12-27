import { Logo } from "../../Logo";
import { ConnectWallet } from "../ConnectWallet";
import { links } from "./header.consts";
import { NavSlideTabs } from "~/lib/organisms/NavSlideTabs/NavSlideTabs";

export const Header = () => {
  return (
    <section className="flex justify-center border-b border-divider w-full bg-background">
      <div className="px-11 flex items-center justify-between h-[60px] w-container bg-background">
        <Logo />
        <HeaderLinksBlock />
      </div>
    </section>
  );
};

const HeaderLinksBlock = () => {
  return (
    <header className="flex gap-x-9 items-center h-full justify-between w-full">
      <NavSlideTabs tabs={links} fixedWidth={124} />

      <ConnectWallet />
    </header>
  );
};
