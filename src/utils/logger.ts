import { createLogger, format, transports } from "winston";

const start = new Date();
const startTime = start.getTime();

function getSimpleVal(val: unknown, depth = 0): unknown {
  if (Array.isArray(val)) {
    return val.length > 10 || depth >= 2
      ? `[Length = ${val.length}]`
      : val.map((x) => getSimpleVal(x, depth + 1));
  }

  if (val instanceof Date) {
    return val.toISOString();
  }

  if (typeof val === "object" && val !== null) {
    if (depth >= 2) return "[Object]";
    return Object.fromEntries(
      Object.entries(val).map(([key, value]) => {
        return [key, getSimpleVal(value, depth + 1)];
      })
    );
  }

  return val;
}

const addTimestamp = format.timestamp({
  format: () => new Date(Date.now() - startTime).toISOString().slice(14, 23),
});

const addSplat = format((info) => {
  const { [Symbol.for("splat")]: splat } = info;
  const val = Array.isArray(splat) ? splat[0] : splat;
  info.simpleSplat = getSimpleVal(val);
  info.fullSplat = val;
  return info;
})();

const formatPrint = (splatType: string) =>
  format.printf(({ timestamp, level, message, [splatType]: splat }) => {
    const isCollapse = Array.isArray(splat) && typeof splat[0] !== "object";
    const expandVal = isCollapse ? undefined : 2;
    const splatString =
      splat == null ? "" : `: ${JSON.stringify(splat, null, expandVal)}`;
    return `${timestamp} [${level.toUpperCase()}]: ${message}${splatString}`;
  });

export const logger = createLogger({
  level: "info",
  format: format.combine(addTimestamp, addSplat),
  transports: [
    new transports.Console({
      level: "info",
      format: formatPrint("simpleSplat"),
    }),
    new transports.File({
      filename: "logs/start.log",
      level: "debug",
      format: formatPrint("fullSplat"),
    }),
  ],
});

// Add initial log line
logger.info(`Logger initialized @ ${start.toISOString()}`);
