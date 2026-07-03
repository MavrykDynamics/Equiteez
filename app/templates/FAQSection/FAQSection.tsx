import React, { FC, useEffect, useRef, useState } from "react";
import styles from "./faqSection.module.css";
import clsx from "clsx";

import ArrowDown from "app/icons/chevron-down.svg?react";
import { useAppContext } from "~/providers/AppProvider/AppProvider";
import { Heading } from "~/lib/atoms/Typography/Heading";
import { Text } from "~/lib/atoms/Typography/Text";
// import { isVisibleInViewport } from '~/lib/utils/element-in-view';

export type FaqType = {
  data: { title: string; description: string | React.JSX.Element }[];
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
        .split("#")
        .shift()
        ?.concat(`#faq-${idx}`);
      window.history.pushState({}, "", newUrl);
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

    const n = hash.split("#faq-").pop();

    const element = document.querySelector(`[data-active-article="faq-${n}"]`);

    if (!element) return;

    element.scrollIntoView({
      block: "start",
      behavior: "instant",
    });
  }, []);

  return (
    <section className="flex gap-x-[90px] gap-y-6 relative flex-col xl:flex-row">
      <div className="xl:max-w-[506px] max-w-full">
        <Heading
          level="3"
          className="xl:text-start text-center mx-auto xl:mx-0"
        >
          Answers To Our Most <br />
          Frequently Asked Questions
        </Heading>
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
  item: FaqType["data"][0];
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
      className={styles.questionWrapper}
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
        <button className="flex items-center justify-between w-full capitalize text-left">
          <Text size="largeBody" weight="semibold">
            {item.title}
          </Text>
          <ArrowDown
            className={clsx(
              "w-6 h-6 min-w-6",
              activeArticleIdx === idx + 1 && "rotate-180"
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
              : "0",
        }}
        className={clsx(
          styles.answercont,
          activeArticleIdx === idx + 1 && "mt-[27px]"
        )}
      >
        <Text size="smallBody">{item.description}</Text>
      </div>
    </div>
  );
};
