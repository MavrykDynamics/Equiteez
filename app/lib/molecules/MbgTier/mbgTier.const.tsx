import EliteTierIcon from "~/icons/wallet/tier/Elite.svg?react";
import DiamondTierIcon from "~/icons/wallet/tier/Diamond.svg?react";
import PlatinumTierIcon from "~/icons/wallet/tier/Platinum.svg?react";
import GoldTierIcon from "~/icons/wallet/tier/Gold.svg?react";
import RubyTierIcon from "~/icons/wallet/tier/Ruby.svg?react";
import EmeraldTierIcon from "~/icons/wallet/tier/Emerald.svg?react";
import SapphireTierIcon from "~/icons/wallet/tier/Sapphire.svg?react";
import AmethystTierIcon from "~/icons/wallet/tier/Amethyst.svg?react";
import SilverTierIcon from "~/icons/wallet/tier/Silver.svg?react";
import BronzeTierIcon from "~/icons/wallet/tier/Bronze.svg?react";

export const MBG_tiers = [
  {
    name: "Elite",
    minBalance: 250000,
    discount: 50,
    color: "#9A8D6680",
    icon: <EliteTierIcon />,
  },
  {
    name: "Diamond",
    minBalance: 100000,
    discount: 45,
    color: "#6A8A9D80",
    icon: <DiamondTierIcon />,
  },
  {
    name: "Platinum",
    minBalance: 45000,
    discount: 40,
    color: "#8D9BA080",
    icon: <PlatinumTierIcon />,
  },
  {
    name: "Gold",
    minBalance: 20000,
    discount: 35,
    color: "#AE8D4180",
    icon: <GoldTierIcon />,
  },
  {
    name: "Ruby",
    minBalance: 10000,
    discount: 30,
    color: "#C4404A80",
    icon: <RubyTierIcon />,
  },
  {
    name: "Emerald",
    minBalance: 4000,
    discount: 25,
    color: "#54A54880",
    icon: <EmeraldTierIcon />,
  },
  {
    name: "Sapphire",
    minBalance: 1000,
    discount: 20,
    color: "#4D66DB80",
    icon: <SapphireTierIcon />,
  },
  {
    name: "Amethyst",
    minBalance: 600,
    discount: 15,
    color: "#A04EC580",
    icon: <AmethystTierIcon />,
  },
  {
    name: "Silver",
    minBalance: 250,
    discount: 10,
    color: "#98939380",
    icon: <SilverTierIcon />,
  },
  {
    name: "Bronze",
    minBalance: 100,
    discount: 5,
    color: "#A67F5980",
    icon: <BronzeTierIcon />,
  },
];

export const empty_MBG_tier = {
  name: "No Tier",
  minBalance: 0,
  discount: 0,
  color: "#6F6F6F80",
  icon: "",
};

export const MBG_tiers_with_empty_item = [...MBG_tiers, empty_MBG_tier];
