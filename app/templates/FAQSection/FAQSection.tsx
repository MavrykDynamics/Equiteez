import { FC, useEffect, useMemo, useRef, useState } from 'react';
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
          <Question
            key={item.title}
            idx={idx}
            activeArticleIdx={activeArticleIdx}
            item={item}
            handleClick={handleHeaderClick}
          />
        ))}
      </div>
    </section>
  );
};

type QuestionType = {
  handleClick: (idx: number) => void;
  activeArticleIdx: number;
  idx: number;
  item: FaqType['data'][0];
};

const Question: FC<QuestionType> = ({
  idx,
  activeArticleIdx,
  item,
  handleClick,
}) => {
  const answerRef = useRef<HTMLDivElement | null>(null);

  return (
    <div
      role="presentation"
      className="text-content text-card-headline py-8 border-b border-divider flex-1 cursor-pointer"
      id={`faq-${idx + 1}`}
      onClick={() => handleClick(idx + 1)}
    >
      <div
        className={clsx(
          styles.question,
          activeArticleIdx === idx && styles.active
        )}
        data-active-article={`faq-${idx + 1}`}
      >
        <button className="flex items-center justify-between w-full capitalize">
          <div className={styles.faqSubHeader}>{item.title}</div>
          <ArrowDown
            className={clsx(
              'w-6 h-6 text-content stroke-current',
              activeArticleIdx === idx + 1 && 'rotate-180'
            )}
          />
        </button>
      </div>
      <div
        ref={answerRef}
        style={{
          maxHeight:
            activeArticleIdx === idx + 1
              ? `${answerRef.current?.scrollHeight}px`
              : '0',
        }}
        className={clsx('text-content text-body', styles.answercont)}
      >
        {item.description}
      </div>
    </div>
  );
};
