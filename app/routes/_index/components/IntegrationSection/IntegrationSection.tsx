import { ProgressBlocks } from './ProgressBlocks';

export const IntegrationSection = () => {
  return (
    <section className="px-11">
      <div className="mb-11 flex flex-col gap-y-3">
        <h1 className="text-content text-hero">Full DeFi Integration</h1>
        <p className="text-body text-content-secondary max-w-[738px]">
          Discover new opportunities powered by decentralized finance. The Maven
          Finance lending platform allows you to supercharge your earnings by
          leveraging your tokenized portfolio.
        </p>
      </div>
      <ProgressBlocks />
    </section>
  );
};
