import { v4 as uuid } from "uuid";

type dipdupedLvlListener = (currentLvl: number) => void;

const currentDipdupLvl: {
  currentDipdupeddLevel: number;
  listeners: Map<string, dipdupedLvlListener>;
  registerListener: (listener: dipdupedLvlListener) => string;
  removeListener: (listenerId: string) => void;
} = {
  currentDipdupeddLevel: 0,
  listeners: new Map(),
  registerListener: function (listener) {
    const listenerId = uuid();
    this.listeners.set(listenerId, listener);
    return listenerId;
  },
  removeListener: function (listenerId) {
    if (this.listeners.has(listenerId)) {
      this.listeners.delete(listenerId);
    } else {
      if (process.env.NDOE_ENV === "development")
        console.error(
          `listener with Id: ${listenerId} do not present in: ${JSON.stringify(this.listeners)}`
        );
    }
  },
};

export const currentDipdupLvlProxy = new Proxy(currentDipdupLvl, {
  set: function (target, key, value) {
    if (key === "currentDipdupeddLevel") {
      target["currentDipdupeddLevel"] = value;
      target["listeners"].forEach((fn) => fn(value));
      return true;
    }

    throw new Error(
      `Wrong key selected, you tried ${key.toString()}, but allowed to change only currentDipdupeddLevel`
    );
  },
});
