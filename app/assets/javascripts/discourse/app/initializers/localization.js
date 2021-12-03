import I18n from "I18n";
import bootbox from "bootbox";

export default {
  name: "localization",
  after: "inject-objects",

  isVerboseLocalizationEnabled(container) {
    const siteSettings = container.lookup("site-settings:main");
    if (siteSettings.verbose_localization) {
      return true;
    }

    try {
      return sessionStorage && sessionStorage.getItem("verbose_localization");
    } catch (e) {
      return false;
    }
  },

  initialize(container) {
    if (this.isVerboseLocalizationEnabled(container)) {
      I18n.enableVerboseLocalization();
    }

    // Merge any overrides into our object
    for (const [locale, overrides] of Object.entries(I18n._overrides || {})) {
      for (const [k, v] of Object.entries(overrides)) {
        const segs = k.replace("admin_js", "js").split(".");
        let node = I18n.translations[locale] || {};

        for (let i = 0; i < segs.length - 1; i++) {
          if (!(segs[i] in node)) {
            node[segs[i]] = {};
          }
          node = node[segs[i]];
        }

        if (typeof node === "object") {
          node[segs[segs.length - 1]] = v;
        }
      }
    }

    for (const [locale, mfOverrides] of Object.entries(
      I18n._mfOverrides || {}
    )) {
      for (let [key, value] of Object.entries(mfOverrides)) {
        key = key.replace(/^[a-z_]*js\./, "");

        if (locale === I18n.locale || !!I18n._compiledMFs[key]) {
          I18n._compiledMFs[key] = value;
        }
      }
    }

    bootbox.addLocale(I18n.currentLocale(), {
      OK: I18n.t("composer.modal_ok"),
      CANCEL: I18n.t("composer.modal_cancel"),
      CONFIRM: I18n.t("composer.modal_ok"),
    });
    bootbox.setLocale(I18n.currentLocale());
  },
};
