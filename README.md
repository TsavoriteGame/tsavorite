# Tsavorite

## Getting Started

Ensure you have NodeJS v18 (needed for `structuredClone`).

```bash
npm install
```

(You might need to add `--legacy-peer-deps` due to one dependency not having the correct setup.)

### Updating Items

If you add new items (new entries or files in `content/items`), run the following command to regenerate `items.json`:

```bash
npm run setup:data
```

### Updating Art

If you need to update the art files (`src/app/assets/images/game`), run the following command to regenerate the art: 

```bash
npm run setup:art
```

## Project Structure

| Folder | Description                                      |
|--------|--------------------------------------------------|
| app    | Electron main process folder (NodeJS)            |
| src    | Electron renderer process folder (Web / Angular) |

## Included Commands

| Command                  | Description                                                                                           |
|--------------------------|-------------------------------------------------------------------------------------------------------|
| `npm run start:web`      | Execute the app in the web browser (DEV mode)                                                         |
| `npm run start`          | Execute the app in a local electron container (DEV mode)                                              |
| `npm run web:build`      | Build the app that can be used directly in the web browser. Your built files are in the /dist folder. |
| `npm run test`           | Test your local content against the provided unit tests.                                              |
| `npm run test:jest:watch`| Watch your local code changes and tests and run them in real time.                                    |
| `npm run lint`           | Lint your code to make sure it fits the projects style.                                               |

## Creating "Art"

Permenary assets are generated using Stable Diffusion. While setup of SD is not covered here, the parameters to generate the art are:

* Base Prompts: game item icon, artstation, by anton fadeev david fortin, Pat Presley, ryan lang, concept art, digital 2d, trending on pixiv, Clean Cel shaded vector art, highly detailed
* Image Size: 256x256
* Sampling Steps: 150 samples
* Sampling Method: k_euler
* Classifier Free Guidance Scale: 18

## Adding New Interactions

Adding new interactions requires an SVG to represent it. There are some important steps to follow so it will render properly:

- Get the icon from [Game Icons Font](https://seiyria.com/gameicons-font/) as an SVG
- Add it to `src/app/assets/images/reactions`
- Remove `fill="#000"` from the SVG, or any other fills

## Creating Landmarks

* Learning rxjs recommended: [rxmarbles](https://rxmarbles.com/).

## Enabling Debug Mode

Click the logo on the home screen 10 times.

## Important Information

Minimum supported resolution: 1440x900
