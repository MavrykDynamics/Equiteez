import clsx from "clsx";
// import { FOOTER_LINKS } from './pagelayout.consts';
import { Link } from "@remix-run/react";
// import { SOCIALS } from '~/consts/icons';

import LogoIcon from "app/icons/logo.svg?react";

export const Footer = () => {
  return (
    <footer className={clsx("bg-sand-900 flex flex-col items-center")}>
      <div className="flex justify-between px-[100px] pt-[54px] pb-[122px] w-container">
        <div className="max-w-[420px] flex flex-col items-start">
          <Link to="/" className="flex items-center gap-x-[10px] w-auto">
            <LogoIcon className="text-white stroke-current" />
            <span className="text-white text-[26px] font-semibold leading-6">
              EQUITEEZ
            </span>
          </Link>
          <p className="text-body text-white mt-[26px] mb-8">
            The future of real estate ownership is digital. Start with just $50
            to invest in fractionalized, fully compliant, income producing
            assets worldwide.
          </p>
          {/* <div className="flex items-center gap-x-[21px]">
            {SOCIALS.map(({ Icon, id, url }) => (
              <Link key={id} to={url}>
                <div className="w-9 h-9 flex justify-center items-center">
                  <Icon className="fill-white" />
                </div>
              </Link>
            ))}
          </div> */}
        </div>
        <div className="flex gap-x-[88px] pr-[63px]">
          {/* {FOOTER_LINKS.map(({ id, links, title }) => (
            <div key={id} className="flex flex-col items-start gap-y-6">
              <h3 className="text-white text-card-headline">{title}</h3>
              {links.map((link, idx) => (
                <Link
                  key={link.label.concat(idx.toString())}
                  to={link.url}
                  className="text-white text-body-xs"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))} */}
        </div>
      </div>
      {/* <div className="bg-green-main h-10 mt-[72px] w-full" /> */}
    </footer>
  );
};
