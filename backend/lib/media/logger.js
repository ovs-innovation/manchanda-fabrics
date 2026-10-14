const write = (level, event, data = {}) => {
  const entry = {
    ts: new Date().toISOString(),
    level,
    scope: "media",
    event,
    ...data,
  };
  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
};

module.exports = {
  info: (event, data) => write("info", event, data),
  warn: (event, data) => write("warn", event, data),
  error: (event, data) => write("error", event, data),
};
