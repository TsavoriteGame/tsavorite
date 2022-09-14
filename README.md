# Tsavorite

## Getting Started

Ensure you have node v18 (needed for `structuredClone`).

```bash
npm install
```

## Project structure

| Folder | Description                                      |
|--------|--------------------------------------------------|
| app    | Electron main process folder (NodeJS)            |
| src    | Electron renderer process folder (Web / Angular) |

## Included Commands

| Command                  | Description                                                                                           |
|--------------------------|-------------------------------------------------------------------------------------------------------|
| `npm run ng:serve`       | Execute the app in the web browser (DEV mode)                                                         |
| `npm run web:build`      | Build the app that can be used directly in the web browser. Your built files are in the /dist folder. |
| `npm run electron:local` | Builds your application and start electron locally                                                    |
| `npm run electron:build` | Builds your application and creates an app consumable based on your operating system                  |

## Creating "Art"

Permenary assets are generated using Stable Diffusion. While setup of SD is not covered here, the parameters to generate the art are:

* Base Prompts: game item icon, artstation, by anton fadeev david fortin, Pat Presley, ryan lang, concept art, digital 2d, trending on pixiv, Clean Cel shaded vector art, highly detailed
* Image Size: 256x256
* Sampling Steps: 150 samples
* Sampling Method: k_euler
* Classifier Free Guidance Scale: 18
