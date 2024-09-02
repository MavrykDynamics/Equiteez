import Card1Icon from 'app/assets/home/icons/house-check.svg?react';
import Card2Icon from 'app/assets/home/icons/circle-rect.svg?react';
import Card3Icon from 'app/assets/home/icons/circle-house.svg?react';
import Card4Icon from 'app/assets/home/icons/send-triangle.svg?react';
import { CardWithShadow } from '~/lib/atoms/CardWithShadow';
import clsx from 'clsx';

const CARDS = [
  {
    id: 1,
    Icon: Card1Icon,
    title: 'No downpayment required',
    description:
      'Buy fractional shares of yield bearing investments starting at just $50. Each token represents fractional ownership of the asset. The more you own, the more you earn.',
  },
  {
    id: 2,
    Icon: Card2Icon,
    title: (
      <>
        Earn rent today, <br />
        appreciation tomorow
      </>
    ),
    description:
      'Get monthly dividends paid directly to your account! Watch your assets grow in value over time, and sell to collect on the principle appreciation whenever you think best.',
  },
  {
    id: 3,
    Icon: Card3Icon,
    title: (
      <>
        Own multiple properties <br />
        without managment issues
      </>
    ),
    description:
      'Diversify your investments without expanding your workload. Just build your own portfolio, and let the professional managers handle the rest.',
  },
  {
    id: 4,
    Icon: Card4Icon,
    title: (
      <>
        Have full control of <br />
        your investments
      </>
    ),
    description:
      'Zero lock-in periods and full transparency reports. Reinvest your dividend income, sell whenever you like, or get a loan in minutes to leverage your portfolio.',
  },
];

export const PortfolioSection = () => {
  return (
    <section className="px-11 flex justify-between items-center gap-x-[116px]">
      <div className="min-w-[488px] max-w-[488px] flex flex-col items-start gap-y-3">
        <h2 className="text-content text-section-headline">
          Jumpstart your portfolio. Invest like the pros
        </h2>
        <p className="text-content-secondary text-body">
          Get instant access to amazing income producing deals and join a
          community of wealth builders from around the world.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-x-6">
        {CARDS.map(({ Icon, id, title, description }, idx) => (
          <div key={id} className={clsx((idx + 1) % 2 === 0 && 'pt-6')}>
            <CardWithShadow className="h-[339px]">
              <div className="flex flex-col items-start">
                <Icon className="mb-6" />
                <h3 className="text-card-headline text-content mb-3">
                  {title}
                </h3>
                <p className="text-content text-body">{description}</p>
              </div>
            </CardWithShadow>
          </div>
        ))}
      </div>
    </section>
  );
};
