# Contributing

Use Node 22/24 LTS and `npm ci`. Run `npm test`, `npm run check`, `npm run lint` and `npm run build`. For UI changes, start the local service, run `npm run test:ui`, render an example and inspect representative frames. For timeline/audio changes also run `npx tsx tests/media-integration.ts` after generating the three examples.

Keep the Story schema, preview and export shared. Do not add timer-based export logic, paid services, telemetry, vendor assets or upstream code without documented permission. Add focused tests for behavior changes. Generated user projects, recordings, logs and large videos must not be committed. Preserve dependency licenses. Document actual commands and results; never mark an unrun test as passed.

Pull requests should describe the concrete problem, resulting behavior, tests and any remaining limitations. Use fictional data in bug reproductions. New themes and TTS engines should compose existing modules rather than duplicate parsers, media-process wrappers or queues.
