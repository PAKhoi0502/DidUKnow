import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from "../../config/i18n.js";

export const getSupportedLanguagesController = (req, res) => {
    return res.status(200).json({
        message: "languages.supported_get_success",
        data: {
            supported_languages: SUPPORTED_LANGUAGES,
            default_language: DEFAULT_LANGUAGE
        }
    });
};
