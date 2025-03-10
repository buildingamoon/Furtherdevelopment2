// trusted-types-init.js
const tt = window.trustedTypes;

if (tt) {
  try {
    // Create a Trusted Types policy named 'nuxt'
    const policy = tt.createPolicy('nuxt', {
      createHTML: (val) => val,
      createScriptURL: (val) => val,
      createScript: (val) => val,
    });

    // Use the policy to handle HTML and scripts
    const unsafeToTrustedHTML = (val) => policy.createHTML(val);
  } catch (e) {
    console.warn(`Error creating trusted types policy: ${e}`);
  }
} else {
  console.warn('Trusted Types are not supported in this browser.');
}
