# Tilda Router

A ready-to-use component for enhanced in-page routing on Tilda-based websites.


## Demo

See how the very same hash-based navigation ups [Tera kulta](terakulta.com) to the next level of UX.

[//]: # (TODO: Add a cool screencast from the Tk main page.)


## How to use

1. For all built-in Tilda navigation-related blocks that you use, take their overrides from the `tilda-overrides` 
directory and add them at the top of your page (or at the bottom of the "header") within a dedicated HTML block.

2. Similarly, add the `tilda-router.js` (or its minified version) and then the following snippet:

   ```
   window.router = new TildaRouter(window.location);
   ```

3. Add a dedicated anchor link (block `T173`) in front of each navigable block. Note that popup links have to be in the 
standard Tilda `#popup:name-of-your-popup` format to work properly.

4. In case you want some blocks to attract navigation (e.g. when the product's popup is opened from outside the parent 
block and you want to keep the user focused on what is open now), pass their dedicated anchors upon the `TildaRouter` 
construction as shown below:

   ```
   window.router = new TildaRouter(window.location, { attractors: [ '#my-very', '#important', '#blocks' ] });
   ```

5. Enjoy the new in-page routing!


## Changelog

- Update to support a newer version of Tilda Catalog:
  - tilda-catalog-1.1
- Initial version built upon:
  - tilda-blocks-2.7 
  - tilda-catalog-1.0
  - tilda-products-1.0
  - tilda-slds-1.4
