import CloseIcon from "app/icons/cross.svg?react";
import type { ReactNode } from "react";

import { useRefundAllAssetOrders } from "~/hooks/useRefundAllAssetOrders";
import { formatRefundUnits } from "~/lib/apis/rwa/refunds/refunds.helpers";
import type { AssetRefundsScan } from "~/lib/apis/rwa/refunds/refunds.types";
import type { DirectOrderFee } from "~/contracts/directOrderFee";
import Money from "~/lib/atoms/Money";
import { RButton } from "~/lib/atoms/RButton";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";
import { Spinner } from "~/lib/atoms/Spinner";
import CustomPopup from "~/lib/organisms/CustomPopup/CustomPopup";
import { MILLION } from "~/lib/utils/numbers";

import styles from "./styles.module.css";

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
    fee,
    isEstimatingFee,
    canRetryFee,
    retryFee,
    reason,
    refundAll,
    progress,
    isRefunding,
  } = useRefundAllAssetOrders({ tokenAddress, enabled: isOpen });

  const handleClose = () => {
    if (!isRefunding) onClose();
  };

  const handleRefund = async () => {
    if (canRetryFee) {
      void retryFee();
      return;
    }

    const isCompleted = await refundAll();

    if (isCompleted) {
      onClose();
    } else {
      void rescan();
    }
  };

  const renderContent = () => {
    if (isScanning) {
      return (
        <PopupBody
          description={`Checking your ${assetSymbol} orders and calculating the refund amount…`}
          title="Checking Refunds"
        >
          <div className={styles.loader}>
            <Spinner size={32} />
          </div>
        </PopupBody>
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
                Close
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
          description="We couldn't load your refunds. Please try again."
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
              ? `${scan.blockedCount} ${pluralizeOrders(scan.blockedCount)} can't be refunded right now. Please try again later.`
              : `You have no ${assetSymbol} orders to refund.`
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
              No
            </RButton>
            <RButton
              className={styles.actionButton}
              disabled={Boolean(reason) && !canRetryFee}
              isLoading={isRefunding || isEstimatingFee}
              onClick={handleRefund}
              size="medium"
              tone="black"
            >
              {canRetryFee ? "Retry" : "Refund"}
            </RButton>
          </>
        }
        description={`Are you sure you want to refund all your closed ${assetSymbol} orders?`}
        title="Claim All Refunds"
      >
        <RefundDetails fee={fee} scan={scan} />
        {reason && !isEstimatingFee && !isRefunding ? (
          <RText color="neutral-700" size="body-s">
            {reason}
          </RText>
        ) : null}
        {isRefunding && progress ? (
          <div className={styles.progressNote}>
            <Spinner size={16} />
            <RText color="neutral-700" size="body-s">
              {progress.total > 1
                ? `Processing transaction ${progress.current} of ${progress.total}. `
                : "Processing refund. "}
              This may take some time, please keep this window open.
            </RText>
          </div>
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

function RefundDetails({
  fee,
  scan,
}: {
  fee: DirectOrderFee | undefined;
  scan: AssetRefundsScan;
}) {
  return (
    <div className={styles.details}>
      <DetailRow label="Orders to refund" value={scan.eligibleCount} />
      {scan.totals.map((total) => (
        <DetailRow
          key={`${total.tokenAddress}-${total.tokenId}`}
          label="You will receive"
          value={
            total.decimals === null ? (
              "Amount unavailable"
            ) : (
              <>
                <Money tooltip={false} cryptoDecimals={total.decimals}>
                  {formatRefundUnits(total.amountUnits, total.decimals)}
                </Money>{" "}
                {total.symbol ?? ""}
              </>
            )
          }
        />
      ))}
      {scan.parts.length > 1 ? (
        <DetailRow label="Wallet signatures" value={scan.parts.length} />
      ) : null}
      {scan.blockedCount > 0 ? (
        <DetailRow label="Unavailable right now" value={scan.blockedCount} />
      ) : null}
      {fee ? (
        <DetailRow
          label="Estimated network fee"
          value={`~ ${fee.totalDebit.div(MILLION).toFixed()} MVRK`}
        />
      ) : null}
      {scan.parts.length > 1 ? (
        <RText color="neutral-700" size="body-s">
          Refunds are sent in several transactions. Completed transactions stay
          claimed if a later one fails.
        </RText>
      ) : null}
    </div>
  );
}

function PopupBody({
  actions,
  children,
  description,
  title,
}: {
  actions?: ReactNode;
  children?: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <div className={styles.contentWrapper}>
      <div className={styles.mainContent}>
        <div className={styles.heading}>
          <RHeading size="h6" weight="medium">
            {title}
          </RHeading>
          <RText color="neutral-700" size="body-sm">
            {description}
          </RText>
        </div>
        {children}
      </div>
      {actions ? (
        <>
          <div aria-hidden className={styles.divider} />
          <div className={styles.btnWrapper}>{actions}</div>
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

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className={styles.detailRow}>
      <RText color="neutral-700" size="body-sm">
        {label}
      </RText>
      <RText size="body-sm">{value}</RText>
    </div>
  );
}

function pluralizeOrders(count: number) {
  return count === 1 ? "order" : "orders";
}
