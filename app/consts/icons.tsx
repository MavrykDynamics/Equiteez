import TelegramIcon from "app/icons/telegram.svg?react";
import GithubIcon from "app/icons/github.svg?react";
import TwitterIcon from "app/icons/twitter.svg?react";
import DiscordIcon from "app/icons/discord.svg?react";

export const SOCIALS = [
  {
    id: "twitter",
    Icon: TwitterIcon,
    url: "/",
  },
  {
    id: "discord",
    Icon: DiscordIcon,
    url: "/",
  },
  {
    id: "GithubIcon",
    Icon: GithubIcon,
    url: "/",
  },
  {
    id: "telegram",
    Icon: TelegramIcon,
    url: "/",
  },
];

export const SECONDARY_SOCIALS = [SOCIALS[0], SOCIALS[3]];
