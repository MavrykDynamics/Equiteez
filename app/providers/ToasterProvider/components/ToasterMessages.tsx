import { useEffect, useState } from "react";

import { useToasterContext } from "../toaster.provider";
import { ToasterAnimationType, ToasterMessage } from "../toaster.provider.type";
import styles from "./toasterMessages.module.css";

import {
  ANIMATION_DURATION,
  TOASTER_HIDE,
  TOASTER_REVEAL,
  TOASTS_LIMIT,
  TOAST_ICON_MAPPER,
  TOAST_TIME_TO_LIVE,
} from "../toaster.provider.const";
import classNames from "clsx";
import { sleep } from "~/lib/utils/sleep";
import { Icon } from "~/lib/atoms/Icon";

const Toast = ({ toast }: { toast: ToasterMessage }) => {
  const [toastAnimation, setToastAnimation] =
    useState<ToasterAnimationType>(TOASTER_REVEAL);
  const { hideToasterMessage, deleteToasterFromArray } = useToasterContext();
  const { title, message, type, unique, hide } = toast;

  // effect to update toast property "hide" to 'true' for playing hide animation
  useEffect(() => {
    (async () => {
      await sleep(TOAST_TIME_TO_LIVE);
      hideToasterMessage(unique);
    })();
  }, [hideToasterMessage, type, unique]);

  // play hide animation and completely delete toast
  useEffect(() => {
    if (hide) {
      (async () => {
        setToastAnimation(TOASTER_HIDE);
        // wait for animation finish
        await sleep(ANIMATION_DURATION);
        deleteToasterFromArray(unique);
      })();
    }
  }, [deleteToasterFromArray, hide, unique]);

  return (
    <div
      className={classNames(
        styles.toaster,
        styles[toastAnimation],
        styles[type]
      )}
    >
      <Icon className={"size-6 min-w-6"} icon={TOAST_ICON_MAPPER[type]} />
      <div className={styles.content}>
        {title && <div className={styles.title}>{title}</div>}
        <div className={styles.message}>{message}</div>
      </div>
      <div
        role="presentation"
        onClick={() => hideToasterMessage(unique)}
        className={styles.closeIconWrapper}
      >
        <Icon className={"size-6 stroke-sand-900"} icon="cross" />
      </div>
    </div>
  );
};

export const ToasterMessages = () => {
  const { messages, deleteToasterFromArray } = useToasterContext();

  // remove toasts starting from the oldest if messages limit was passed
  useEffect(() => {
    if (messages.length > TOASTS_LIMIT) {
      const messagesToRemoveCount = messages.length - TOASTS_LIMIT;
      Array.from({ length: messagesToRemoveCount }).forEach((_, idx) => {
        if (!messages[idx]) return;
        deleteToasterFromArray(messages[idx].unique);
      });
    }
  }, [messages, deleteToasterFromArray]);

  if (!messages.length) return null;

  return (
    <div className={styles.toasterContainer}>
      {messages.map((m) => (
        <Toast key={m.unique} toast={m} />
      ))}
    </div>
  );
};
