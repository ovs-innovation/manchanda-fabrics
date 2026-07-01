const isLegacyHomepageKey = (key) =>
  key.endsWith("Homepage") && key !== "manchandaHomepage";

const resolveHomepageSettings = (setting = {}) => {
  if (setting.manchandaHomepage) {
    return setting.manchandaHomepage;
  }

  for (const [key, value] of Object.entries(setting)) {
    if (isLegacyHomepageKey(key) && value && typeof value === "object") {
      return value;
    }
  }

  return {};
};

const withManchandaHomepage = (setting = {}, homepagePatch = {}) => {
  const current = resolveHomepageSettings(setting);
  return {
    ...setting,
    manchandaHomepage: {
      ...current,
      ...homepagePatch,
    },
  };
};

module.exports = {
  resolveHomepageSettings,
  withManchandaHomepage,
};
