import CloseIcon from "app/icons/toast-close.svg?react";
import ErrorIcon from "app/icons/refund-error.svg?react";
import InfoIcon from "app/icons/gas-credit-info.svg?react";
import LoadingIcon from "app/icons/refund-loading.svg?react";
import LoadingLightIcon from "app/icons/refund-loading-light.svg?react";
import NoticeInfoIcon from "app/icons/refund-info.svg?react";
import ProcessingIcon from "app/icons/refund-processing.svg?react";
import type { ReactNode } from "react";
import { BigNumber } from "bignumber.js";

import type { DirectOrderFee } from "~/contracts/directOrderFee";
import {
  type RefundAllCreditsInfo,
  type RefundAllProgress,
  useRefundAllAssetOrders,
} from "~/hooks/useRefundAllAssetOrders";
import {
  CREDIT_PRICE_USDT,
  formatCredits,
} from "~/layouts/PageLayout/WalletDropdown/CreditsWalletDropdown/credits.utils";
import { toTokenSlug } from "~/lib/assets";
import { formatRefundUnits } from "~/lib/apis/rwa/refunds/refunds.helpers";
import type {
  AssetRefundsScan,
  RefundTokenTotal,
} from "~/lib/apis/rwa/refunds/refunds.types";
import Money from "~/lib/atoms/Money";
import { RButton } from "~/lib/atoms/RButton";
import { RTooltip } from "~/lib/atoms/RTooltip";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";
import CustomPopup from "~/lib/organisms/CustomPopup/CustomPopup";
import { MILLION } from "~/lib/utils/numbers";
import { AssetIcon } from "~/templates/AssetIcon";

import styles from "./styles.module.css";

const UNAVAILABLE_ORDERS_TOOLTIP =
  "These orders can't be refunded right now, for example while order data is syncing or refunds are paused. Please try again later.";

type RefundAllPopupProps = {
  assetSymbol: string;
  isOpen: boolean;
  onClose: () => void;
  tokenAddress: string;
};

export function RefundAllPopup({
  assetSymbol,
  isOpen,
  onClose,
  tokenAddress,
}: RefundAllPopupProps) {
  const {
    scan,
    isScanning,
    scanError,
    rescan,
    paymentMethod,
    fee,
    creditsInfo,
    isPreparing,
    canRetry,
    retry,
    reason,
    refundAll,
    progress,
    isRefunding,
    needsSignIn,
    signIn,
  } = useRefundAllAssetOrders({
    tokenAddress,
    enabled: isOpen,
    onRunEnd: (isCompleted) => {
      if (isCompleted) {
        onClose();
      } else {
        void rescan();
      }
    },
  });

  const handleClose = () => {
    if (!isRefunding) onClose();
  };

  const handleRefund = () => {
    if (needsSignIn) {
      signIn();
      return;
    }

    if (canRetry) {
      retry();
      return;
    }

    refundAll();
  };

  const renderContent = () => {
    if (isRefunding && progress && scan) {
      return <ProcessingBody progress={progress} totals={scan.totals} />;
    }

    if (isScanning) {
      return (
        <PopupBody
          description={`We’re checking your ${assetSymbol} orders and calculating your refund amount. This may take a few seconds.`}
          footer={
            <RText
              className={styles.footerNote}
              color="neutral-700"
              size="body-sm"
            >
              Please wait while we check your orders.
            </RText>
          }
          title="Checking Your Orders"
          titleIcon={<LoadingIcon aria-hidden className={styles.loadingIcon} />}
        />
      );
    }

    if (scanError || !scan) {
      return (
        <PopupBody
          actions={
            <>
              <RButton
                className={styles.actionButton}
                onClick={onClose}
                size="medium"
                tone="black"
                variant="secondary"
              >
                Cancel
              </RButton>
              <RButton
                className={styles.actionButton}
                onClick={() => void rescan()}
                size="medium"
                tone="black"
              >
                Try Again
              </RButton>
            </>
          }
          actionsClassName={styles.btnWrapperWide}
          description="We couldn’t check your orders. Please try again."
          statusIcon={
            <div className={styles.errorIconWrapper}>
              <ErrorIcon aria-hidden className={styles.errorIcon} />
            </div>
          }
          title="Something Went Wrong"
        />
      );
    }

    if (!scan.isRealtime) {
      return (
        <PopupBody
          actions={<OkButton onClick={onClose} />}
          description="Order data is still syncing. Please try again in a minute."
          title="Refunds Unavailable"
        />
      );
    }

    if (scan.eligibleCount === 0) {
      return (
        <PopupBody
          actions={<OkButton onClick={onClose} />}
          description={
            scan.blockedCount > 0
              ? `${pluralizeOrders(scan.blockedCount)} can’t be refunded right now. Please try again later.`
              : "There are no orders available for a refund at this time."
          }
          title="No Refunds Available"
        />
      );
    }

    return (
      <PopupBody
        actions={
          <>
            <RButton
              className={styles.actionButton}
              disabled={isRefunding}
              onClick={onClose}
              size="medium"
              tone="black"
              variant="secondary"
            >
              Cancel
            </RButton>
            <RButton
              className={styles.actionButton}
              disabled={Boolean(reason) && !canRetry && !needsSignIn}
              isLoading={isRefunding || isPreparing}
              onClick={handleRefund}
              size="medium"
              tone="black"
            >
              {needsSignIn ? "Sign In" : canRetry ? "Retry" : "Refund"}
            </RButton>
          </>
        }
        description="Review the orders and amounts before confirming your refund."
        title="Review Your Refund"
      >
        <RefundDetails
          creditsInfo={creditsInfo}
          fee={fee}
          paymentMethod={paymentMethod}
          scan={scan}
        />
        {reason && !isPreparing && !isRefunding ? (
          <RText color="neutral-700" size="body-sm">
            {reason}
          </RText>
        ) : null}
      </PopupBody>
    );
  };

  return (
    <CustomPopup
      isOpen={isOpen}
      contentPosition="center"
      className={styles.popupWrapper}
    >
      <div className={styles.closeRow}>
        <button
          aria-label="Close dialog"
          className={styles.closeButton}
          disabled={isRefunding}
          onClick={handleClose}
          type="button"
        >
          <CloseIcon aria-hidden className={styles.closeIcon} />
        </button>
      </div>
      {renderContent()}
    </CustomPopup>
  );
}

function ProcessingBody({
  progress,
  totals,
}: {
  progress: RefundAllProgress;
  totals: RefundTokenTotal[];
}) {
  return (
    <PopupBody
      description="Your refund is being processed. Please confirm each transaction in your wallet."
      title={
        totals.length > 0 ? (
          <span className={styles.processingTitle}>
            {totals.map((total, index) => (
              <span key={`${total.tokenAddress}-${total.tokenId}`}>
                {index > 0 ? " + " : null}
                {total.decimals === null ? (
                  "Amount unavailable"
                ) : (
                  <>
                    <Money tooltip={false} cryptoDecimals={total.decimals}>
                      {formatRefundUnits(total.amountUnits, total.decimals)}
                    </Money>{" "}
                    {total.symbol ?? ""}
                  </>
                )}
              </span>
            ))}
          </span>
        ) : (
          "Processing Refund"
        )
      }
    >
      <div className={styles.progressRow}>
        <div className={styles.progressStep}>
          <ProcessingIcon aria-hidden className={styles.processingIcon} />
          <div className={styles.progressCopy}>
            <RText size="body-sm" weight="medium">
              Wallet Signature
            </RText>
            <RText color="neutral-700" size="body-s">
              {`Waiting for confirmations (${progress.current - 1}/${progress.total})`}
            </RText>
          </div>
        </div>
        <RText color="neutral-700" size="body-s">
          In progress
        </RText>
      </div>
      <div className={styles.processingNotice}>
        <NoticeInfoIcon aria-hidden className={styles.noticeIcon} />
        <RText size="body-sm">
          This may take some time. Please keep this window open and approve each
          request in your wallet.
        </RText>
      </div>
      <button
        aria-busy
        aria-label="Processing refund"
        className={styles.processingButton}
        disabled
        type="button"
      >
        <LoadingLightIcon aria-hidden className={styles.loadingIcon} />
      </button>
    </PopupBody>
  );
}

function RefundDetails({
  creditsInfo,
  fee,
  paymentMethod,
  scan,
}: {
  creditsInfo: RefundAllCreditsInfo | undefined;
  fee: DirectOrderFee | undefined;
  paymentMethod: "credits" | "mvrk" | null;
  scan: AssetRefundsScan;
}) {
  return (
    <div className={styles.details}>
      <DetailRow
        label="Number of orders"
        value={pluralizeOrders(scan.eligibleCount)}
      />
      {scan.totals.map((total) => (
        <DetailRow
          key={`${total.tokenAddress}-${total.tokenId}`}
          label="You will receive"
          value={
            total.decimals === null ? (
              "Amount unavailable"
            ) : (
              <span className={styles.tokenValue}>
                <AssetIcon
                  assetSlug={toTokenSlug(total.tokenAddress, total.tokenId)}
                  className={styles.tokenIcon}
                  size={20}
                />
                <span>
                  <Money tooltip={false} cryptoDecimals={total.decimals}>
                    {formatRefundUnits(total.amountUnits, total.decimals)}
                  </Money>{" "}
                  {total.symbol ?? ""}
                </span>
              </span>
            )
          }
        />
      ))}
      <DetailRow
        label={
          <span className={styles.labelWithInfo}>
            Unavailable orders
            <RTooltip content={UNAVAILABLE_ORDERS_TOOLTIP} maxWidth={315}>
              <button
                aria-label={UNAVAILABLE_ORDERS_TOOLTIP}
                className={styles.infoButton}
                type="button"
              >
                <InfoIcon aria-hidden />
              </button>
            </RTooltip>
          </span>
        }
        value={scan.blockedCount > 0 ? pluralizeOrders(scan.blockedCount) : "–"}
      />
      <DetailRow
        label="Wallet signatures"
        value={`${scan.parts.length} ${scan.parts.length === 1 ? "signature" : "signatures"}`}
      />
      {paymentMethod === "mvrk" && fee ? (
        <DetailRow
          label="Network fee"
          value={`~ ${fee.totalDebit.div(MILLION).toFixed()} MVRK`}
        />
      ) : null}
      {paymentMethod === "credits" && creditsInfo ? (
        <DetailRow
          label="Gas Credit"
          value={
            creditsInfo.feeUnits === 0n || creditsInfo.feeDecimals === null
              ? "Free"
              : formatCredits(
                  new BigNumber(creditsInfo.feeUnits.toString())
                    .shiftedBy(-creditsInfo.feeDecimals)
                    .div(CREDIT_PRICE_USDT)
                )
          }
        />
      ) : null}
    </div>
  );
}

function PopupBody({
  actions,
  actionsClassName,
  children,
  description,
  footer,
  statusIcon,
  title,
  titleIcon,
}: {
  actions?: ReactNode;
  actionsClassName?: string;
  children?: ReactNode;
  description: string;
  footer?: ReactNode;
  statusIcon?: ReactNode;
  title: ReactNode;
  titleIcon?: ReactNode;
}) {
  return (
    <div className={styles.contentWrapper}>
      {statusIcon}
      <div className={styles.heading}>
        <div className={styles.titleRow}>
          {titleIcon}
          <RHeading size="h6" weight="medium">
            {title}
          </RHeading>
        </div>
        <RText color="neutral-700" size="body-sm">
          {description}
        </RText>
      </div>
      {children}
      {actions || footer ? (
        <>
          <div aria-hidden className={styles.divider} />
          {actions ? (
            <div className={actionsClassName ?? styles.btnWrapper}>
              {actions}
            </div>
          ) : (
            footer
          )}
        </>
      ) : null}
    </div>
  );
}

function OkButton({ onClick }: { onClick: () => void }) {
  return (
    <RButton
      className={styles.actionButton}
      onClick={onClick}
      size="medium"
      tone="black"
    >
      OK
    </RButton>
  );
}

function DetailRow({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <div className={styles.detailRow}>
      <RText color="neutral-700" size="body-sm">
        {label}
      </RText>
      <RText className={styles.detailValue} size="body-sm">
        {value}
      </RText>
    </div>
  );
}

function pluralizeOrders(count: number) {
  return `${count} ${count === 1 ? "order" : "orders"}`;
}
