// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver.resolveRequest = (
  context: { resolveRequest: (arg0: any, arg1: any, arg2: any) => any },
  moduleImport: string,
  platform: any
) => {
  // Always import the ESM version of all `@firebase/*` packages
  if (moduleImport.startsWith("@firebase/")) {
    return context.resolveRequest(
      {
        ...context,
        isESMImport: true, // Mark the import method as ESM
      },
      moduleImport,
      platform
    );
  }

  return context.resolveRequest(context, moduleImport, platform);
};

module.exports = config;
