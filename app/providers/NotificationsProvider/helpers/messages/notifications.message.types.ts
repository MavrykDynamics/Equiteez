export type NotifierToastTone = "success" | "info" | "warning";

export type NotifierToastMessage = {
  tone: NotifierToastTone;
  title: string;
  message: string;
};
