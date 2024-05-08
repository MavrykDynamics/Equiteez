import { FC, useEffect, useState } from 'react';
import styles from './faqSection.module.css';
import { IS_WEB } from '~/consts/general';
import clsx from 'clsx';

import ArrowDown from 'app/icons/arrow-down.svg?react';

export type FaqType = {
  data: { title: string; description: string | JSX.Element }[];
};

export const FAQSection: FC<FaqType> = ({ data }) => {
  const [activeArticleIdx, setActiveArticleIdx] = useState(-1);
  const [isScrollAllowed, setIsScrollAllowed] = useState(false);

  const handleHeaderClick = (idx: number) => {
    const idxToSet = idx === activeArticleIdx ? -1 : idx;
    setActiveArticleIdx(idxToSet);

    if (IS_WEB) {
      const newUrl = window.location.href
        .split('#')
        .shift()
        ?.concat(`#faq-${idx}`);
      window.history.pushState({}, '', newUrl);
    }

    if (!isScrollAllowed) setIsScrollAllowed(true);
  };

  useEffect(() => {
    return () => {
      setIsScrollAllowed(false);
    };
  }, []);

  // scroll to chosen article
  useEffect(() => {
    const element = document.querySelector(
      `[data-active-article="faq-${activeArticleIdx}"]`
    );

    if (!element || !isScrollAllowed) return;

    element.scrollIntoView({
      block: 'start',
      inline: 'nearest',
      behavior: 'smooth',
    });
  }, [activeArticleIdx, isScrollAllowed]);

  return (
    <section className="px-11 flex gap-x-[90px]">
      <div className="max-w-[506px] min-w-[506px]">
        <h2 className="text-content text-section-headline">
          Answers to our most frequently asked questions
        </h2>
      </div>
      <div className="flex flex-col flex-1">
        {data.map((item, idx) => (
          <div
            key={item.title}
            className="text-content text-card-headline py-8 border-b border-divider flex-1"
            id={`faq-${idx + 1}`}
          >
            <div
              className={styles.mobileArticle}
              data-active-article={`faq-${idx + 1}`}
            >
              <button
                className="flex items-center justify-between w-full"
                onClick={() => handleHeaderClick(idx + 1)}
              >
                <div className={styles.faqSubHeader}>{item.title}</div>
                <ArrowDown
                  className={clsx(
                    'w-6 h-6 text-content stroke-current',
                    activeArticleIdx === idx + 1 &&
                      'transition duration-500 rotate-180'
                  )}
                />
              </button>

              <div
                className={clsx(
                  'text-content text-body',
                  styles.description,
                  activeArticleIdx === idx + 1 && styles.active
                )}
              >
                {item.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
