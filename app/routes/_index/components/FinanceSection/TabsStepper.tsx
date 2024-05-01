import { FC } from 'react';
import { ListSnake } from 'app/organisms/ListSnake';

type TabsStepperProps = { tabId: string };

const financeStepperContent: StringRecord<string[]> = {
  buying: [
    'Buy EQ tokens',
    'Add to Personal Vault',
    'Borrow Instantly',
    'Buy More EQ Tokens',
    'Multiply Your Dividends',
  ],
  selling: ['Sell EQ tokens', 'Sell Instantly', 'Sell More EQ Tokens'],
  borrowing: [
    'Borrow EQ tokens',
    'Borrow to Personal Vault',
    'Borrow Instantly',
    'Borrow More EQ Tokens',
    'Multiply Your Borrowings',
  ],
};

export const TabsStepper: FC<TabsStepperProps> = ({ tabId }) => {
  return (
    <div>
      <ListSnake items={financeStepperContent[tabId]} />
    </div>
  );
};
