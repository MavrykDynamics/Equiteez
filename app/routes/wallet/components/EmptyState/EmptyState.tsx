import React from "react";
import { Text } from "~/lib/atoms/Typography/Text";

export function EmptyState({
  title,
  description,
  height,
}: {
  title: string;
  description: string;
  height?: string;
}) {
  return (
    <div
      style={{ height }}
      className="flex flex-col h-[640px] gpa-[8px] items-center justify-center"
    >
      <Text weight="bold">{title}</Text>
      <Text size="smallBody" color="lightBlue" className="text-center">
        {description}
      </Text>
    </div>
  );
}
