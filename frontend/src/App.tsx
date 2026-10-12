import { useEffect, useMemo, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { MonacoBinding } from "y-monaco";
import * as Y from "yjs";
import { SocketIOProvider } from "y-socket.io";
import "./index.css";
interface User {
  username: string;
}

interface AwarenessState {
  user?: User | null;
}

export default function App() {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const [username, setUsername] = useState<string>(() => {
    return new URLSearchParams(window.location.search).get("username") || "";
  });

  const [users, setUsers] = useState<User[]>([]);

  const ydoc = useMemo(() => new Y.Doc(), []);
  const yText = useMemo(() => ydoc.getText("monaco"), [ydoc]);

  const handleJoin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const enteredUsername = String(formData.get("username") || "").trim();

    if (!enteredUsername) return;

    const params = new URLSearchParams(window.location.search);
    params.set("username", enteredUsername);

    window.history.pushState({}, "", `?${params.toString()}`);
    setUsername(enteredUsername);
  };

  const handleMount = (instance: editor.IStandaloneCodeEditor) => {
    editorRef.current = instance;
  };

  useEffect(() => {
    if (!username || !editorRef.current) return;

    const instance = editorRef.current;
    const model = instance.getModel();

    if (!model) return;

    const provider = new SocketIOProvider("/", "monaco", ydoc, {
      autoConnect: true,
    });

    const binding = new MonacoBinding(
      yText,
      model,
      new Set([instance]),
      provider.awareness
    );

    provider.awareness.setLocalStateField("user", { username });

    const updateUsers = () => {
      const states = Array.from(
        provider.awareness.getStates().values()
      ) as AwarenessState[];

      setUsers(
        states
          .filter(
            (state): state is AwarenessState & { user: User } =>
              Boolean(state.user?.username)
          )
          .map((state) => state.user)
      );
    };

    updateUsers();
    provider.awareness.on("change", updateUsers);

    return () => {
      provider.awareness.off("change", updateUsers);
      binding.destroy();
      provider.disconnect();
    };
  }, [username, ydoc, yText]);

  if (!username) {
    return (
      <main className="flex h-screen w-full items-center justify-center bg-gray-950 p-4">
        <form onSubmit={handleJoin} className="flex flex-col gap-4">
          <input
            name="username"
            type="text"
            placeholder="Enter your username"
            required
            className="rounded-lg bg-gray-800 p-2 text-white"
          />

          <button
            type="submit"
            className="rounded-lg bg-amber-50 p-2 font-bold text-gray-950"
          >
            Join
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="flex h-screen w-full gap-4 bg-gray-950 p-4">
      <aside className="h-full w-1/4 overflow-y-auto rounded-lg bg-amber-50">
        <h2 className="border-b border-gray-300 p-4 text-2xl font-bold">
          Users
        </h2>

        <ul className="p-4">
          {users.map((user, index) => (
            <li
              key={`${user.username}-${index}`}
              className="mb-2 rounded bg-gray-800 p-2 text-white"
            >
              {user.username}
            </li>
          ))}
        </ul>
      </aside>

      <section className="w-3/4 overflow-hidden rounded-lg bg-neutral-800">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          defaultValue="// Start coding together..."
          theme="vs-dark"
          onMount={handleMount}
        />
      </section>
    </main>
  );
}