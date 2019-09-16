module.exports = {
  // Use a preprocessor for all Jest tests and inject babel config needed for
  // Jest which differs from Gatsby's.
  "transform": {
    "^.+\\.jsx?$": "<rootDir>/jest-preprocess.js"
  },
  "moduleNameMapper": {
    ".+\\.(css|styl|less|sass|scss)$": "identity-obj-proxy",
    ".+\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/__mocks__/fileMock.js"
  },
  "testPathIgnorePatterns": ["node_modules", ".cache"],
  // Gatsby includes un-transpiled ES6 code in gatsby-browser-entry.js.
  // gatsby-theme-osiolabs-drupal contains uncompiled ES6.
  "transformIgnorePatterns": ["node_modules/(?!(gatsby|gatsby-theme-osiolabs-drupal)/)"],
  "globals": {
    "__PATH_PREFIX__": ""
  },
  "testURL": "http://localhost",
  "setupFiles": [
    "<rootDir>/loadershim.js",
  ],
  "setupFilesAfterEnv": [
    '@testing-library/react/cleanup-after-each',
    "<rootDir>/setup-test-env.js"
  ],
};
