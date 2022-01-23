# ytsub-v2

```sh
# development server
npm run webpack:dev

# type check
npm run tsc:dev

# format
npm run prettier

# testing
npm run test
npm run test:playwright

# deployment
# - initialize
npm install -g netlify-cli
netlify login
netlify sites:create --name ytsub-hiro18181
netlify link --name ytsub-hiro18181
# - deploy
npm run deploy
```
