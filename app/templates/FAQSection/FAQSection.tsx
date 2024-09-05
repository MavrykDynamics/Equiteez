import { FC, useEffect, useState } from 'react';
import styles from './faqSection.module.css';
import clsx from 'clsx';

import ArrowDown from 'app/icons/chevron-down.svg?react';
import { useAppContext } from '~/providers/AppProvider/AppProvider';
// import { isVisibleInViewport } from '~/lib/utils/element-in-view';

export type FaqType = {
  data: { title: string; description: string | JSX.Element }[];
};

export const FAQSection: FC<FaqType> = ({ data }) => {
  const [activeArticleIdx, setActiveArticleIdx] = useState(-1);
  const [isScrollAllowed, setIsScrollAllowed] = useState(false);
  const { IS_WEB } = useAppContext();

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

  // scroll to chosen article in init
  useEffect(() => {
    const hash = window.location.hash;

    if (!hash) return;

    const n = hash.split('#faq-').pop();

    const element = document.querySelector(`[data-active-article="faq-${n}"]`);

    if (!element) return;

    element.scrollIntoView({
      block: 'start',
      behavior: 'instant',
    });
  }, []);

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
            role="presentation"
            key={item.title}
            className="text-content text-card-headline py-8 border-b border-divider flex-1 cursor-pointer"
            id={`faq-${idx + 1}`}
            onClick={() => handleHeaderClick(idx + 1)}
          >
            <div
              className={styles.mobileArticle}
              data-active-article={`faq-${idx + 1}`}
            >
              <button className="flex items-center justify-between w-full capitalize">
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
