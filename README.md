# Hooks / Interview Lab

An interactive React learning project for front-end interview preparation. Every Hook example has a short code comment **directly below the Hook call** explaining its purpose and when to use it. The app shows the original commented JSX, even in the production build.

## Run

Use Node.js 20.19+ or 22.12+ (verified here with Node 26.11.1).

```sh
cd /Users/boddupallylokesh/Documents/Codex/2026-10-21/react-hooks-interview-lab/outputs/react-hooks-lab
npm install --cache ../../work/npm-cache
npm run dev
```

Open the local address printed by Vite (normally http://127.0.0.1:5173). Dependencies are already installed in this workspace. The workspace-local cache avoids the existing user-cache permission issue. For a fresh copy elsewhere, ordinary `npm install` is sufficient.

```sh
npm run build
npm run preview
npm test
```

The browser tests use an installed Google Chrome (`channel: 'chrome'`). To use Playwright Chromium instead, remove that option in `playwright.config.js` and run `npx playwright install chromium`. These are local tests with simulated data, not real submissions.

## Learning path

1. **Foundations:** useState, useReducer, useContext, useRef, useEffect, useId.
2. **Performance:** useMemo, useCallback, useTransition, useDeferredValue.
3. **Actions and forms:** useActionState, useFormStatus (from react-dom), useOptimistic.
4. **Advanced and libraries:** useSyncExternalStore, useDebugValue, useLayoutEffect, useImperativeHandle, useInsertionEffect, useEffectEvent.
5. **Related API:** use reads context conditionally here. It is an API, not a Hook.

That covers all **18 hooks exported by React**, plus the **React DOM useFormStatus hook**, across 18 lessons. Combined lessons demonstrate related hooks together. Navigate with the sidebar, try the controls, read the code, predict the result, then open the interview check. Marking a lesson explored updates session-only progress. Switching lessons unmounts the previous demo and resets its local state.

## Interview takeaways

- State is a render snapshot. Queue functional setters when calculating from prior state.
- Reducers are pure state-transition functions; context distributes a value and subscribes consumers.
- Refs retain mutable values without requesting renders. State drives visible output.
- Effects synchronize external systems. Derive render data directly, include reactive dependencies, and clean up subscriptions.
- Layout Effects block painting; insertion Effects are intended for styling libraries. Ordinary effects and layout work do not execute on a server.
- Memoization is an optimization. useMemo caches results; useCallback caches function identity. Profile before adding either.
- Transitions prioritize render updates; they do not move expensive JavaScript off-thread. Deferred values are not fixed-delay debouncing or network throttling.
- Actions can be client functions. useActionState tracks their results, useFormStatus reads a parent form, and useOptimistic provides temporary state during an Action.
- External stores need stable snapshots and cleanup. useDebugValue is visible in React DevTools, not a page label.
- useEffectEvent is for non-reactive logic called by Effects. It is not a dependency-lint escape hatch or UI event callback.
- Hooks run at the top level of components/custom Hooks. The use API allows conditional calls but still belongs inside a component or Hook.

## Files

- `src/main.jsx`: commented demos, learning content, and app shell.
- `src/style.css`: responsive layout, focus styles, and visual design.
- `vite.config.js`: unminified educational build to preserve source-view function names.
- `tests/lab.spec.js`: lesson smoke checks, counter, focus, forms, optimistic rollback, timer, and mobile search checks.
- `package.json` / `package-lock.json`: scripts and locked dependencies (React and React DOM 19.3.1).

## Scope and limitations

This is a client-only Vite app. Requests are simulated delays; no backend, persistence, account, Server Components, Server Functions, or deployment is included. The optional Google Fonts request has system-font fallbacks. Strict Mode intentionally rehearses effects and pure calculations in development.

useDebugValue needs React DevTools for inspection. Timing demos may complete too quickly to visibly show pending states on fast hardware. No artificial CPU blocking is added. useInsertionEffect is a small library-oriented illustration; use CSS for ordinary app styles. Layout measurement runs on mount and the demo's size toggle, rather than tracking every viewport resize.

The use lesson demonstrates a supported context read. Promise reads require stable cached promises and Suspense/error boundaries; frameworks commonly supply this integration. Creating new promises during render is unsupported. Reading context with use is not supported in Server Components. Progressive enhancement/permalink behavior of useActionState requires server/framework integration and is not demonstrated.

## Documentation verification

Checked on 21 October 2026 against the official stable reference; React docs identify 19.3 as current, and npm provided patch 19.3.1:

- [Built-in React Hooks](https://react.dev/reference/react/hooks)
- [React DOM Hooks](https://react.dev/reference/react-dom/hooks)
- [React versions](https://react.dev/versions)
- [use](https://react.dev/reference/react/use)
- [useEffectEvent](https://react.dev/reference/react/useEffectEvent)
- [useActionState](https://react.dev/reference/react/useActionState)
- [useOptimistic](https://react.dev/reference/react/useOptimistic)

## Verification in this workspace

- Dependency installation completed; npm reported zero vulnerabilities.
- Production build passed.
- In-app browser: all 18 lessons mounted and displayed the explanatory comments; counter increment, async form pending/success, and optimistic failure rollback were checked. No captured browser warnings or errors were reported during that pass.
- `npm test` was attempted, but the sandbox prevented Chrome from launching (SIGABRT/EPERM). The automated suite is included for running locally; it has **not** passed here. Mobile layout is implemented but automated mobile verification remains unconfirmed.
