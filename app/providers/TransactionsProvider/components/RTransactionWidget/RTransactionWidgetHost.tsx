import { createRef, useEffect, useRef, type RefObject } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { useTransactionWidget } from "../../TransactionWidgetProvider";
import { RTransactionWidget } from "./RTransactionWidget";
import styles from "./RTransactionWidgetHost.module.css";

/** Presentation only; received deposit events own widget progress. */
export function RTransactionWidgetHost() {
  const { visibleModels, isOpen, dismiss } = useTransactionWidget();
  const panel = useRef<HTMLElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const shouldFollow = useRef(true);
  const itemRefs = useRef(new Map<string, RefObject<HTMLDivElement>>());
  const animationTimers = useRef(
    new Map<string, ReturnType<typeof setTimeout>>()
  );
  useEffect(() => {
    const timers = animationTimers.current;
    return () => {
      timers.forEach(clearTimeout);
      timers.clear();
    };
  }, []);
  const getItemRef = (id: string) => {
    let ref = itemRefs.current.get(id);
    if (!ref) {
      ref = createRef<HTMLDivElement>();
      itemRefs.current.set(id, ref);
    }
    return ref;
  };
  useEffect(() => {
    const scrollToBottom = () => {
      if (shouldFollow.current && panel.current)
        panel.current.scrollTop = panel.current.scrollHeight;
    };
    scrollToBottom();
    if (!content.current || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(scrollToBottom);
    observer.observe(content.current);
    if (panel.current) observer.observe(panel.current);
    return () => observer.disconnect();
  }, [isOpen, visibleModels]);
  if (!isOpen) return null;
  return (
    <section
      ref={panel}
      aria-label="Bridge deposits"
      className={styles.panel}
      onScroll={(event) => {
        const target = event.currentTarget;
        shouldFollow.current =
          target.scrollHeight - target.scrollTop - target.clientHeight <= 2;
      }}
    >
      <div ref={content}>
        <TransitionGroup component={null}>
          {visibleModels.map((model) => {
            const id = model.backendId ?? model.operationId;
            const ref = getItemRef(id);
            return (
              <CSSTransition
                key={id}
                nodeRef={ref}
                addEndListener={(done: () => void) => {
                  clearTimeout(animationTimers.current.get(id));
                  animationTimers.current.set(
                    id,
                    setTimeout(() => {
                      animationTimers.current.delete(id);
                      done();
                    }, 360)
                  );
                }}
                classNames={{
                  enter: styles.collapsed,
                  enterActive: styles.expanded,
                  exitActive: styles.collapsed,
                }}
                onExited={() => itemRefs.current.delete(id)}
              >
                <div ref={ref} className={styles.item}>
                  <div className={styles.clip}>
                    <div className={styles.spacing}>
                      <RTransactionWidget
                        amount={model.amount}
                        amountMode="token"
                        symbol={model.symbol}
                        recipient={model.recipient}
                        sourceExplorerUrl={model.sourceExplorerUrl}
                        state={model.state}
                        onDismiss={
                          model.isTerminal
                            ? () =>
                                dismiss(model.backendId ?? model.operationId)
                            : undefined
                        }
                      />
                    </div>
                  </div>
                </div>
              </CSSTransition>
            );
          })}
        </TransitionGroup>
      </div>
    </section>
  );
}
