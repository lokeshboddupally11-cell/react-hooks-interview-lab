import React, {
  StrictMode,
  createContext,
  memo,
  use,
  useState,
  useReducer,
  useContext,
  useRef,
  useImperativeHandle,
  useEffect,
  useLayoutEffect,
  useInsertionEffect,
  useEffectEvent,
  useMemo,
  useCallback,
  useTransition,
  useDeferredValue,
  useDebugValue,
  useId,
  useSyncExternalStore,
  useActionState,
  useOptimistic,
} from "react";
import { createRoot } from "react-dom/client";
import { useFormStatus } from "react-dom";
import "./style.css";
import rawSource from "./main.jsx?raw";
function showSource(fn) {
  const start = rawSource.indexOf("function " + fn.name + "(");
  const lineEnd = rawSource.indexOf("\n", start);
  const end = rawSource.slice(start, lineEnd).endsWith("}")
    ? lineEnd - 2
    : rawSource.indexOf("\n}", start);
  return start < 0 ? fn.toString() : rawSource.slice(start, end + 2);
}

const Theme = createContext("indigo");
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function StateDemo() {
  const [count, setCount] = useState(0);
  // useState remembers render data; use a functional update when the next value depends on the previous one.
  return (
    <>
      <output className="number">{count}</output>
      <button
        onClick={() => {
          setCount((n) => n + 1);
          setCount((n) => n + 1);
        }}
      >
        Add two
      </button>
      <button className="secondary" onClick={() => setCount(0)}>
        Reset
      </button>
    </>
  );
}
function reducer(state, action) {
  if (action.type === "add") return { ...state, count: state.count + 1 };
  if (action.type === "reset") return { count: 0 };
  return state;
}
function ReducerDemo() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });
  // useReducer centralizes related state transitions in a pure function; useful when event logic grows.
  return (
    <>
      <output className="number">{state.count}</output>
      <button onClick={() => dispatch({ type: "add" })}>
        Complete question
      </button>
      <button className="secondary" onClick={() => dispatch({ type: "reset" })}>
        Reset
      </button>
    </>
  );
}
function ContextChild() {
  const theme = useContext(Theme);
  // useContext reads and subscribes to the nearest provider; useful for shared preferences without prop drilling.
  return (
    <p className={`swatch ${theme}`}>
      A nested component reads: <strong>{theme}</strong>
    </p>
  );
}
function ContextDemo() {
  const [theme, setTheme] = useState("indigo");
  // useState controls the provider value so consumers can react to a preference change.
  return (
    <Theme value={theme}>
      <button
        onClick={() => setTheme((t) => (t === "indigo" ? "mint" : "indigo"))}
      >
        Switch shared theme
      </button>
      <ContextChild />
    </Theme>
  );
}
function RefDemo() {
  const input = useRef(null);
  // useRef retains a mutable reference without triggering renders; useful for focusing a DOM input.
  return (
    <>
      <input
        ref={input}
        aria-label="Focus target"
        placeholder="Click the focus button"
      />
      <button onClick={() => input.current.focus()}>Focus input</button>
    </>
  );
}
function EffectDemo() {
  const [running, setRunning] = useState(false);
  // useState tracks whether the external timer should be connected.
  const [seconds, setSeconds] = useState(0);
  // useState stores elapsed time because it appears in the UI.
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [running]);
  // useEffect synchronizes with a timer after commit; cleanup prevents duplicate timers and handles unmounts.
  return (
    <>
      <output className="number">{seconds}s</output>
      <button onClick={() => setRunning((r) => !r)}>
        {running ? "Pause timer" : "Start timer"}
      </button>
      <p>Development Strict Mode rehearses setup → cleanup → setup.</p>
    </>
  );
}
function IdDemo() {
  const id = useId();
  // useId creates an instance-specific accessibility ID; useful for reusable fields, never list keys.
  return (
    <>
      <label htmlFor={id}>Your interview goal</label>
      <input id={id} placeholder="Explain effects confidently" />
      <small>Generated association: {id}</small>
    </>
  );
}
const topics = Array.from(
  { length: 2500 },
  (_, i) =>
    `${["State", "Effects", "Context", "Rendering", "Forms"][i % 5]} practice question ${i + 1}`,
);
const Results = memo(function Results({ query }) {
  const results = useMemo(
    () => topics.filter((t) => t.toLowerCase().includes(query.toLowerCase())),
    [query],
  );
  // useMemo caches derived results while dependencies match; useful for costly calculations, not correctness.
  return (
    <>
      <p>{results.length} matching questions · showing first 15</p>
      <ul className="results">
        {results.slice(0, 15).map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </>
  );
});
function MemoDemo() {
  const [query, setQuery] = useState("");
  // useState tracks the filter that invalidates the cached calculation.
  const [count, setCount] = useState(0);
  // useState supplies an unrelated update to explore memoization.
  const result = useMemo(
    () => topics.filter((t) => t.includes("State")).length,
    [],
  );
  // useMemo reuses a result until its dependencies change; this fixed-data example computes only on mount (apart from development checks).
  return (
    <>
      <p>
        Cached State questions: {result} · unrelated count: {count}
      </p>
      <button onClick={() => setCount((c) => c + 1)}>Unrelated render</button>
      <input
        aria-label="Memo filter"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Filter topics"
      />
      <Results query={query} />
    </>
  );
}
const AddButton = memo(function AddButton({ onAdd }) {
  return <button onClick={onAdd}>Add with stable callback</button>;
});
function CallbackDemo() {
  const [count, setCount] = useState(0);
  // useState stores the count displayed by this parent.
  const onAdd = useCallback(() => setCount((c) => c + 1), []);
  // useCallback caches a function identity; useful with memoized children, not for making function execution faster.
  return (
    <>
      <output className="number">{count}</output>
      <AddButton onAdd={onAdd} />
      <p>
        The child is wrapped in memo. Profile real code before adding
        memoization.
      </p>
    </>
  );
}
function TransitionDemo() {
  const [query, setQuery] = useState("");
  // useState keeps the controlled input urgent so typing stays responsive.
  const [filter, setFilter] = useState("");
  // useState stores the separately scheduled results query.
  const [pending, startTransition] = useTransition();
  // useTransition marks rendering work as interruptible; it cannot control a text input or move JavaScript to a worker.
  return (
    <>
      <input
        aria-label="Transition filter"
        value={query}
        onChange={(e) => {
          const value = e.target.value;
          setQuery(value);
          startTransition(() => setFilter(value));
        }}
      />
      <p role="status">{pending ? "Updating results…" : "Results ready"}</p>
      <Results query={filter} />
    </>
  );
}
function DeferredDemo() {
  const [query, setQuery] = useState("");
  // useState updates the input immediately.
  const deferred = useDeferredValue(query);
  // useDeferredValue lets a slower child lag behind an urgent value; useful when you receive a value rather than its setter.
  return (
    <>
      <input
        aria-label="Deferred filter"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div style={{ opacity: query !== deferred ? 0.5 : 1 }}>
        <Results query={deferred} />
      </div>
      <p>
        No fixed delay or request throttling is implied; on fast devices the lag
        may be invisible.
      </p>
    </>
  );
}
function SubmitButton() {
  const { pending } = useFormStatus();
  // useFormStatus reads the parent form's submission status; useful for a nested submit button, not the component that creates the form.
  return (
    <button disabled={pending}>{pending ? "Saving…" : "Save answer"}</button>
  );
}
function ActionDemo() {
  const [state, action, pending] = useActionState(
    async (previous, form) => {
      await wait(800);
      const answer = String(form.get("answer")).trim();
      return answer
        ? { message: `Saved: ${answer}`, count: previous.count + 1 }
        : { ...previous, message: "Please write an answer first." };
    },
    { message: "Ready to practice.", count: 0 },
  );
  // useActionState keeps an Action's result and pending state; useful for async form feedback and validation.
  return (
    <form action={action}>
      <label htmlFor="answer">What does an Effect synchronize?</label>
      <input id="answer" name="answer" placeholder="An external system" />
      <SubmitButton />
      <p role="status">
        {state.message} ({state.count} saved)
      </p>
      <small>Action pending: {String(pending)} · simulated local request</small>
    </form>
  );
}
function OptimisticDemo() {
  const [likes, setLikes] = useState(0);
  // useState holds the confirmed value after the simulated request succeeds.
  const [error, setError] = useState("");
  // useState displays a handled request failure.
  const [optimistic, addOptimistic] = useOptimistic(likes, (n) => n + 1);
  // useOptimistic shows a temporary result during an Action; useful for immediate feedback that reverts when a request fails.
  return (
    <form
      action={async (form) => {
        setError("");
        addOptimistic();
        await wait(900);
        if (form.get("fail"))
          setError("Request failed. Temporary like reverted.");
        else setLikes((n) => n + 1);
      }}
    >
      <output className="number">{optimistic} likes</output>
      <label className="check">
        <input type="checkbox" name="fail" />
        Simulate failure
      </label>
      <OptimisticButton />
      <p role="status">
        {error || (optimistic !== likes ? "Confirming…" : "Confirmed")}
      </p>
    </form>
  );
}
function OptimisticButton() {
  const { pending } = useFormStatus();
  // useFormStatus disables repeat submissions while this form's Action is running.
  return <button disabled={pending}>Like answer</button>;
}
function useOnline() {
  const online = useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  );
  // useSyncExternalStore subscribes to a browser-owned value with consistent snapshots; useful for external stores and browser APIs.
  useDebugValue(online ? "Online" : "Offline");
  // useDebugValue labels this custom Hook in React DevTools; useful when debugging shared Hook libraries.
  return online;
}
function subscribe(notify) {
  window.addEventListener("online", notify);
  window.addEventListener("offline", notify);
  return () => {
    window.removeEventListener("online", notify);
    window.removeEventListener("offline", notify);
  };
}
function StoreDemo() {
  const online = useOnline();
  return (
    <>
      <p className="swatch">
        Browser reports: <strong>{online ? "Online" : "Offline"}</strong>
      </p>
      <p>
        Toggle your browser's network emulation. This reports connectivity, not
        whether a particular server is reachable. Inspect useOnline in React
        DevTools to see its debug label.
      </p>
    </>
  );
}
function LayoutDemo() {
  const box = useRef(null);
  // useRef provides access to the committed DOM node for measurement.
  const [width, setWidth] = useState(0);
  // useState renders the measured width.
  const [wide, setWide] = useState(false);
  // useState changes the box size to trigger a fresh measurement.
  useLayoutEffect(() => {
    setWidth(Math.round(box.current.getBoundingClientRect().width));
  }, [wide]);
  // useLayoutEffect measures after DOM commit but before paint; useful for positioning, and blocks painting so use sparingly.
  return (
    <>
      <div
        ref={box}
        className="measure"
        style={{ width: wide ? "90%" : "55%" }}
      >
        Measured: {width}px
      </div>
      <button onClick={() => setWide((w) => !w)}>Change width</button>
    </>
  );
}
function FancyInput({ ref }) {
  const input = useRef(null);
  // useRef keeps the underlying input private to this component.
  useImperativeHandle(ref, () => ({ focus: () => input.current.focus() }), []);
  // useImperativeHandle exposes a small imperative API; useful for reusable widgets when declarative props are insufficient.
  return (
    <input
      ref={input}
      aria-label="Imperative input"
      placeholder="Only focus is exposed"
    />
  );
}
function ImperativeDemo() {
  const field = useRef(null);
  // useRef receives the child's custom handle; React 19 accepts ref as a prop without forwardRef.
  return (
    <>
      <FancyInput ref={field} />
      <button onClick={() => field.current.focus()}>
        Focus through handle
      </button>
    </>
  );
}
function InsertionDemo() {
  useInsertionEffect(() => {
    const style = document.createElement("style");
    style.textContent =
      ".injected-example { border: 2px dashed #7c6df0; padding: 18px; border-radius: 12px; }";
    document.head.appendChild(style);
    return () => style.remove();
  }, []);
  // useInsertionEffect inserts library-generated CSS before layout Effects read layout; useful for CSS-in-JS libraries, not application state or measurements.
  return (
    <p className="injected-example">
      This rule was inserted by the demo. Normal application styling belongs in
      CSS.
    </p>
  );
}
function EventDemo() {
  const [name, setName] = useState("Learner");
  // useState holds a value the timer should read without recreating the timer.
  const [message, setMessage] = useState("Waiting for the next tick…");
  // useState displays the latest timer notification.
  const onTick = useEffectEvent(() =>
    setMessage(
      `Hello, ${name}! Latest tick: ${new Date().toLocaleTimeString()}`,
    ),
  );
  // useEffectEvent reads fresh state inside Effect logic without resubscribing; never use it to hide genuinely reactive dependencies.
  useEffect(() => {
    const timer = setInterval(() => onTick(), 2000);
    return () => clearInterval(timer);
  }, []);
  // useEffect owns the timer subscription; its Effect Event is intentionally omitted from dependencies and is not a UI click handler.
  return (
    <>
      <input
        aria-label="Notification name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <p role="status">{message}</p>
    </>
  );
}
function UseDemo() {
  const [show, setShow] = useState(false);
  // useState controls whether the conditional resource read is needed.
  return (
    <Theme value="mint">
      <button onClick={() => setShow((s) => !s)}>Toggle resource read</button>
      <Resource show={show} />
    </Theme>
  );
}
function Resource({ show }) {
  if (show) {
    const theme = use(Theme);
    // use is a resource-reading API, not a Hook; conditional calls are allowed inside components or Hooks.
    return <p>Conditionally read context: {theme}</p>;
  }
  return <p>Resource read is currently skipped.</p>;
}

const lessons = [
  [
    "Foundations",
    "useState",
    "Remember a value",
    StateDemo,
    "Why does adding two work?",
    "Functional setters receive the queued previous state. State is a render snapshot; setting it does not mutate that snapshot.",
  ],
  [
    "Foundations",
    "useReducer",
    "Model state transitions",
    ReducerDemo,
    "When would you choose a reducer?",
    "When related transitions benefit from one pure, testable function. Never mutate the previous state.",
  ],
  [
    "Foundations",
    "useContext",
    "Share a preference",
    ContextDemo,
    "Does context prevent renders?",
    "No. Consumers update when their provider value changes. Keep provider values stable when useful.",
  ],
  [
    "Foundations",
    "useRef",
    "Reach a DOM element",
    RefDemo,
    "Why not store UI data in a ref?",
    "Changing ref.current does not request a render. Use state for visible data.",
  ],
  [
    "Foundations",
    "useEffect",
    "Connect a timer",
    EffectDemo,
    "What belongs in the dependency list?",
    "Every reactive value read by the Effect. Clean up subscriptions; derive ordinary render data during rendering.",
  ],
  [
    "Foundations",
    "useId",
    "Connect labels and fields",
    IdDemo,
    "Can this generate list keys?",
    "No. Keys come from your data; IDs associate accessibility elements across component instances.",
  ],
  [
    "Performance",
    "useMemo",
    "Cache a calculation",
    MemoDemo,
    "Is useMemo a correctness guarantee?",
    "No. It is a performance optimization. React may discard caches; keep calculations pure.",
  ],
  [
    "Performance",
    "useCallback",
    "Keep function identity",
    CallbackDemo,
    "How is it different from useMemo?",
    "It caches the function itself rather than a calculated result. It helps when identity matters to consumers.",
  ],
  [
    "Performance",
    "useTransition",
    "Prioritize typing",
    TransitionDemo,
    "Does a transition delay all work?",
    "No. Its callback runs immediately; marked state updates are non-blocking. Heavy synchronous work still blocks JavaScript.",
  ],
  [
    "Performance",
    "useDeferredValue",
    "Let results catch up",
    DeferredDemo,
    "Is this debouncing?",
    "No. React schedules an interruptible background render without a fixed timeout. It does not reduce network requests.",
  ],
  [
    "Actions & forms",
    "useActionState + useFormStatus",
    "Submit an answer",
    ActionDemo,
    "Why is the submit button a child?",
    "useFormStatus reads a parent form, not a form returned by the same component. These client Actions do not require a server.",
  ],
  [
    "Actions & forms",
    "useOptimistic",
    "Try immediate feedback",
    OptimisticDemo,
    "What happens when saving fails?",
    "The temporary state returns to the confirmed base value after the Action. Handle errors and only commit confirmed data on success.",
  ],
  [
    "Advanced & libraries",
    "useSyncExternalStore + useDebugValue",
    "Subscribe beyond React",
    StoreDemo,
    "Why use an external-store hook?",
    "It coordinates subscriptions and snapshots with concurrent rendering. Snapshots must be stable until the store changes. Debug labels appear in DevTools.",
  ],
  [
    "Advanced & libraries",
    "useLayoutEffect",
    "Measure before paint",
    LayoutDemo,
    "Why not always use layout Effects?",
    "They block paint. Prefer useEffect unless measuring or preventing visible flicker requires pre-paint work.",
  ],
  [
    "Advanced & libraries",
    "useImperativeHandle",
    "Expose a focused API",
    ImperativeDemo,
    "When is an imperative handle justified?",
    "For commands such as focus or scrolling. Prefer ordinary props for state that can be expressed declaratively.",
  ],
  [
    "Advanced & libraries",
    "useInsertionEffect",
    "Insert a style rule",
    InsertionDemo,
    "Who should normally use this?",
    "CSS-in-JS library authors. Do not update state, depend on refs, or assume DOM insertion timing inside this Effect.",
  ],
  [
    "Advanced & libraries",
    "useEffectEvent",
    "Read the latest value",
    EventDemo,
    "Can this replace missing dependencies?",
    "No. Use it for non-reactive logic called from Effects, not regular event handlers or values that should reconnect the Effect.",
  ],
  [
    "Related API",
    "use",
    "Read a resource conditionally",
    UseDemo,
    "Is use a Hook?",
    "It is an API. Unlike Hooks it can be conditional, but must run in a component or Hook. Promise reads integrate with Suspense and Error Boundaries.",
  ],
];
function App() {
  const [selected, setSelected] = useState(0);
  // useState selects the lesson; mounting a different demo resets its local practice state.
  const [filter, setFilter] = useState("");
  // useState remembers the sidebar search text.
  const [done, setDone] = useState([]);
  // useState stores session-only lesson completion for the learning path.
  const [group, title, subtitle, Demo, question, answer] = lessons[selected];
  const source =
    Demo === StoreDemo
      ? `${showSource(useOnline)}\n\n${showSource(subscribe)}`
      : Demo === ActionDemo
        ? `${showSource(ActionDemo)}\n\n${showSource(SubmitButton)}`
        : Demo === ImperativeDemo
          ? `${showSource(ImperativeDemo)}\n\n${showSource(FancyInput)}`
          : Demo === UseDemo
            ? `${showSource(UseDemo)}\n\n${showSource(Resource)}`
            : showSource(Demo);
  return (
    <div className="shell">
      <aside>
        <a className="brand" href="#main">
          <span>H/</span> hooks lab
        </a>
        <p className="eyebrow">THE INTERVIEW EDITION</p>
        <input
          className="search"
          aria-label="Find a hook"
          placeholder="Find a hook…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <nav aria-label="Lessons">
          {[...new Set(lessons.map((l) => l[0]))].map((category) => (
            <section key={category}>
              <h2>{category}</h2>
              {lessons.map(
                (l, i) =>
                  l[0] === category &&
                  l[1].toLowerCase().includes(filter.toLowerCase()) && (
                    <button
                      key={l[1]}
                      className={i === selected ? "active" : ""}
                      aria-current={i === selected ? "page" : undefined}
                      onClick={() => setSelected(i)}
                    >
                      <span>{String(i + 1).padStart(2, "0")}</span>
                      {l[1]}
                      {done.includes(i) && " ✓"}
                    </button>
                  ),
              )}
            </section>
          ))}
        </nav>
        <small>
          {done.length} / {lessons.length} lessons explored
          <br />
          Progress stays in this session.
        </small>
      </aside>
      <main id="main">
        <header>
          <span>LEARN BY CHANGING THINGS</span>
          <a
            href="https://react.dev/reference/react/hooks"
            target="_blank"
            rel="noreferrer"
          >
            React docs ↗
          </a>
        </header>
        <div className="intro">
          <p className="eyebrow">REACT HOOKS / A PRACTICAL FIELD GUIDE</p>
          <h1>
            Understand the hook.
            <br />
            <em>Explain the why.</em>
          </h1>
          <p>
            Small experiments. Readable code. Clear interview answers.
            <br />
            Start with foundations, then work your way deeper.
          </p>
          <div className="pills">
            <span>18 React hooks</span>
            <span>+ useFormStatus</span>
            <span>+ the use API</span>
          </div>
        </div>
        <article>
          <div className="lesson-heading">
            <div>
              <p className="eyebrow">
                {group} · LESSON {String(selected + 1).padStart(2, "0")}
              </p>
              <h2>{title}</h2>
              <p>{subtitle}</p>
            </div>
            <span className="live-dot">LIVE EXAMPLE</span>
          </div>
          <div className="demo" key={selected}>
            <Demo />
          </div>
          <div className="section-label">
            READ THE CODE{" "}
            <span>Comments below each Hook explain why it exists</span>
          </div>
          <pre tabIndex="0" aria-label="Example source">
            <code>{source}</code>
          </pre>
          <details key={`q${selected}`}>
            <summary>Interview check: {question}</summary>
            <p>{answer}</p>
          </details>
          <footer>
            <button
              className="secondary"
              disabled={selected === 0}
              onClick={() => setSelected((s) => s - 1)}
            >
              ← Previous
            </button>
            <button
              onClick={() => {
                setDone((d) => (d.includes(selected) ? d : [...d, selected]));
                setSelected((s) => Math.min(s + 1, lessons.length - 1));
              }}
            >
              Mark explored {selected < lessons.length - 1 ? "& next →" : "✓"}
            </button>
          </footer>
        </article>
        <section className="notes">
          <h2>Keep these rules close.</h2>
          <p>
            Call Hooks at the top level of components or custom Hooks. Keep
            rendering pure. Include reactive Effect dependencies. Custom Hooks
            share logic, not a single shared state instance.
          </p>
          <p>
            <strong>Client lab:</strong> requests are simulated; nothing is
            saved to a server. Effects do not run during server rendering, and
            layout work needs a browser. Server Components and Server Functions
            require a compatible framework. useActionState, useOptimistic and
            browser form Actions work here without one.
          </p>
          <p>
            <strong>About use:</strong> the context example works in this client
            app. Promise reads need stable, cached promises plus Suspense and
            error handling; creating promises during render is unsupported.
            Server Components cannot read context with use. No server-only APIs
            are presented as client Hooks.
          </p>
          <p>
            Source checked against{" "}
            <a href="https://react.dev/versions">current React documentation</a>{" "}
            on 21 October 2026. Development Strict Mode is enabled.
          </p>
        </section>
      </main>
    </div>
  );
}
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
