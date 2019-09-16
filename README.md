## gatsby-theme-osiolabs-drupal

This is a [Gatsby theme](https://www.gatsbyjs.org/docs/themes) that encapsulates the code necessary to interact with the members.osiolabs.com API and provide feedback for a tutorial.

This requires the `gatsby-theme-osiolabs-drupal` theme in order to authenticate users, and communicate with the Drupal API.

This includes a single `<FeedbackForm />` component. 

## Usage

You should use this as part of another Gatsby site.

```
yarn add https://github.com/OsioLabs/gatsby-theme-osiolabs-drupal-feedback
yarn add gatsby-plugin-compile-es6-packages
```

Then add it to your projects _gatsby-config.js_:

```javascript
module.exports = {
  __experimentalThemes: [
    {
      resolve: 'gatsby-theme-osiolabs-drupal-feedback',
    },
  ],
  plugins: [
    // https://www.gatsbyjs.org/docs/themes/api-reference#add-theme-transpilation
    {
      resolve: 'gatsby-plugin-compile-es6-packages',
      options: {
        modules: ['gatsby-theme-osiolabs-drupal-feedback'],
      },
    },
  ]
};
```

Then use the provided component in your codebase. The easiest way to use it is with the `withDrupalOauthConsumer` component from the `gatsby-theme-osiolabs-drupal` theme.
                                                  
Example:

```jsx
<FeedbackForm
  drupalOauthClient={props.drupalOauthClient}
  tutorialId={tutorial.drupal_internal__nid}
  tutorialUrl={tutorial.path.alias}
/>
```

To learn more about how Gatsby theme's work, and especially how to use component shadowing to override components provided by this package checkout the [official docs](https://www.gatsbyjs.org/docs/themes).

## How to do development on this package

If you want to make updates to this package the easiest thing to do is to copy the repo locally and then link it into an existing project.

Use `yarn link` to replace the *web/node_modules/gatsby-themes-osiolabs-drupal-feedback/* with a link to *themes/gatsby-theme-osiolabs-drupal-feedback/*.

```bash
cd themes/gatsby-theme-osiolabs-drupal-feedback/
yarn link
cd ../web/
yarn link gatsby-theme-osiolabs-drupal-feedback
``` 

After that, any changes you make in *themes/gatsby-theme-osiolabs-drupal-feedback/* will be reflected in *web/node_modules/gatsby-theme-osiolabs-drupal-feedback/*.

Note: Anytime you remove the *web/node_modules/* directory you'll need to run `yarn link gatsby-theme-osiolabs-drupal-feedback` again.
