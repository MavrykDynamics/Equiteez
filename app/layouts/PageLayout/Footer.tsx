import clsx from 'clsx';
import { Logo } from '../Logo';

// consts
import { SOCIALS } from 'app/consts/icons';
import { Link } from '@remix-run/react';

import { FOOTER_LINKS } from './pagelayout.consts';

export const Footer = () => {
  return (
    <footer className={clsx('bg-background-secondary')}>
      <div className="flex justify-between px-[100px] pt-9">
        <div className="max-w-[420px] flex flex-col items-start">
          <Logo />
          <p className="text-body text-content mt-[26px] mb-8">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ornare
            cursus sed nunc eget dictum Sed ornare cursus sed nunc eget dictumd
            nunc eget dictum Sed ornare cursus sed nunc eget dictum{' '}
          </p>
          <div className="flex items-center gap-x-5">
            {SOCIALS.map(({ Icon, id, url }) => (
              <Link key={id} to={url}>
                <Icon />
              </Link>
            ))}
          </div>
        </div>
        <div className="flex gap-x-[88px] pr-[63px]">
          {FOOTER_LINKS.map(({ id, links, title }) => (
            <div key={id} className="flex flex-col items-start gap-y-6">
              <h3 className="text-content text-card-headline">{title}</h3>
              {links.map((link, idx) => (
                <Link
                  key={link.label.concat(idx.toString())}
                  to={link.url}
                  className="text-content text-body-xs"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="bg-green-main h-10 mt-[72px]" />
    </footer>
  );
};
