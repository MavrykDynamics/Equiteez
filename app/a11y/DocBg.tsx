import { FC, useLayoutEffect } from 'react';
import { IS_WEB } from '~/consts/general';

type DocBgProps = {
  bgClassName: string;
};

const DocBg: FC<DocBgProps> = ({ bgClassName }) => {
  useLayoutEffect(() => {
    if (IS_WEB) {
      const doc = document.documentElement;
      const toReturn: string[] = [];
      doc.classList.forEach((token) => {
        if (token.startsWith('bg-')) {
          toReturn.push(token);
        }
      });
      doc.classList.remove(...toReturn);

      doc.classList.add(bgClassName);
      return () => {
        doc.classList.remove(bgClassName);
        doc.classList.add(...toReturn);
      };
    }
  }, [bgClassName]);

  return null;
};

export default DocBg;
