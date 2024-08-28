import { FC } from 'react';

type BalanceInputProps = {
  label?: string;
};

export const BalanceInput: FC<BalanceInputProps> = ({ label }) => {
  return (
    <section className="px-4 bg-gray-50 flex flex-col gap-2 rounded-2xl">
      {label && (
        <div className="text-left text-body-xs text-sand-600">{label}</div>
      )}
      <div>{/* Input */}</div>
    </section>
  );
};
