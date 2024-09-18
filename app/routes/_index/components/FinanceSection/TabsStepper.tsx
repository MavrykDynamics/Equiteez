import { FC } from 'react';
import { ListSnake } from '~/lib/organisms/ListSnake';

type TabsStepperProps = { tabId: string };

const financeStepperContent: StringRecord<string[]> = {
  buying: [
    'Buy RWA shares',
    'Add to Personal Vault',
    'Borrow Instantly',
    'Buy More RWA shares',
    'Multiply Your Dividends',
  ],
  selling: ['Sell RWA shares', 'Sell Instantly', 'Sell More RWA shares'],
  borrowing: [
    'Buy RWA Shares',
    'Add to Personal Vault',
    'Borrow Instantly',
    'Buy More RWA Shares',
    'Multiply Your Dividends',
  ],
};

export const TabsStepper: FC<TabsStepperProps> = ({ tabId }) => {
  return (
    <div>
      <ListSnake items={financeStepperContent[tabId]} />
    </div>
  );
};
