# ytsub-v2

```sh
# install dependencies
pnpm install

# development server
pnpm run webpack:dev

# type check
pnpm run tsc:dev

# format
pnpm run prettier

# testing
pnpm run test
pnpm run test:playwright

# deployment
# - initialize
pnpx netlify login
pnpx netlify sites:create --name ytsub-hiro18181
pnpx netlify link --name ytsub-hiro18181
# - deploy
pnpm run deploy
```
