"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { FormEvent, useEffect, useState } from "react";

type Attachment = {
  id: string;
  fileName: string;
};

type Note = {
  id: string;
  text: string;
  author: string;
  category: string;
  importance: boolean;
  createdAt: string;
  attachments: Attachment[];
};

type Customer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  vehicles: {
    id: string;
    registrationNumber: string;
    make: string;
    model: string;
  }[];
  notes: Note[];
};

export default function CustomerDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [noteAuthor, setNoteAuthor] = useState("");
  const [noteCategory, setNoteCategory] = useState("General");
  const [noteImportance, setNoteImportance] = useState(false);
  const [noteFiles, setNoteFiles] = useState<File[]>([]);
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [noteFormError, setNoteFormError] = useState<string | null>(null);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [noteDeleteError, setNoteDeleteError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCustomer() {
      const { id } = await params;

      try {
        const response = await fetch(`/api/customers/${id}`);

        if (!response.ok) {
          throw new Error("Unable to load customer.");
        }

        setCustomer(await response.json());
      } catch (requestError) {
        console.error("Failed to load customer:", requestError);
        setError("Unable to load customer details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadCustomer();
  }, [params]);

  async function handleNoteSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = noteText.trim();
    const author = noteAuthor.trim();

    if (!text) {
      setNoteFormError("Note text is required.");
      return;
    }

    if (text.length > 500) {
      setNoteFormError("Note text must not exceed 500 characters.");
      return;
    }

    if (!author) {
      setNoteFormError("Author is required.");
      return;
    }

    if (!customer) {
      return;
    }

    setIsSubmittingNote(true);
    setNoteFormError(null);

    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customer.id,
          text,
          author,
          category: noteCategory,
          importance: noteImportance,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to create note.");
      }

      const createdNote = { ...result, attachments: [] };

      setCustomer((currentCustomer) =>
        currentCustomer
          ? {
              ...currentCustomer,
              notes: [createdNote, ...currentCustomer.notes],
            }
          : currentCustomer,
      );

      if (noteFiles.length > 0) {
        const formData = new FormData();
        formData.append("noteId", result.id);
        noteFiles.forEach((file) => formData.append("files", file));

        const uploadResponse = await fetch("/api/attachments", {
          method: "POST",
          body: formData,
        });
        const uploadResult = await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(
            uploadResult.error ?? "Note created, but attachments could not be uploaded.",
          );
        }

        setCustomer((currentCustomer) =>
          currentCustomer
            ? {
                ...currentCustomer,
                notes: currentCustomer.notes.map((note) =>
                  note.id === result.id
                    ? { ...note, attachments: uploadResult }
                    : note,
                ),
              }
            : currentCustomer,
        );
      }

      setNoteText("");
      setNoteAuthor("");
      setNoteCategory("General");
      setNoteImportance(false);
      setNoteFiles([]);
    } catch (requestError) {
      console.error("Failed to create note:", requestError);
      setNoteFormError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to create note. Please try again.",
      );
    } finally {
      setIsSubmittingNote(false);
    }
  }

  async function handleNoteDelete(noteId: string) {
    if (!window.confirm("Are you sure you want to delete this note?")) {
      return;
    }

    setDeletingNoteId(noteId);
    setNoteDeleteError(null);

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to delete note.");
      }

      setCustomer((currentCustomer) =>
        currentCustomer
          ? {
              ...currentCustomer,
              notes: currentCustomer.notes.filter((note) => note.id !== noteId),
            }
          : currentCustomer,
      );
    } catch (requestError) {
      console.error("Failed to delete note:", requestError);
      setNoteDeleteError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to delete note. Please try again.",
      );
    } finally {
      setDeletingNoteId(null);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-12">
      <Link
        className="text-sm font-medium text-slate-600 hover:text-slate-900"
        href="/customers"
      >
        &larr; Back to customers
      </Link>

      {isLoading && (
        <p className="mt-8 text-sm text-slate-500" role="status">
          Loading customer...
        </p>
      )}

      {!isLoading && error && (
        <p className="mt-8 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {!isLoading && !error && customer && (
        <>
          <header className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Customer</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {customer.name}
            </h1>
            <div className="mt-4 space-y-1 text-sm text-slate-600">
              {customer.email && <p>{customer.email}</p>}
              {customer.phone && <p>{customer.phone}</p>}
            </div>
          </header>

          <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Vehicles</h2>
            {customer.vehicles.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">No vehicles recorded.</p>
            ) : (
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                {customer.vehicles.map((vehicle) => (
                  <li key={vehicle.id}>
                    <span className="font-medium text-slate-900">
                      {vehicle.registrationNumber}
                    </span>{" "}
                    &middot; {vehicle.make} {vehicle.model}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Notes</h2>
            <form className="mt-4 space-y-4 border-b border-slate-100 pb-6" onSubmit={handleNoteSubmit}>
              <div>
                <label className="block text-sm font-medium text-slate-700" htmlFor="note-text">
                  Note
                </label>
                <textarea
                  className="mt-2 min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  id="note-text"
                  maxLength={500}
                  onChange={(event) => setNoteText(event.target.value)}
                  placeholder="Write a note..."
                  value={noteText}
                />
                <p className="mt-1 text-right text-xs text-slate-500">{noteText.length}/500</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700" htmlFor="note-author">
                    Author
                  </label>
                  <input
                    className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                    id="note-author"
                    onChange={(event) => setNoteAuthor(event.target.value)}
                    value={noteAuthor}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700" htmlFor="note-category">
                    Category
                  </label>
                  <select
                    className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                    id="note-category"
                    onChange={(event) => setNoteCategory(event.target.value)}
                    value={noteCategory}
                  >
                    <option>General</option>
                    <option>Repair</option>
                    <option>Payment</option>
                    <option>Complaint</option>
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  checked={noteImportance}
                  onChange={(event) => setNoteImportance(event.target.checked)}
                  type="checkbox"
                />
                Important note
              </label>
              <div>
                <label className="block text-sm font-medium text-slate-700" htmlFor="note-files">
                  Attachments
                </label>
                <input
                  className="mt-2 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
                  id="note-files"
                  multiple
                  onChange={(event) =>
                    setNoteFiles(Array.from(event.target.files ?? []))
                  }
                  type="file"
                />
                {noteFiles.length > 0 && (
                  <p className="mt-1 text-xs text-slate-500">
                    {noteFiles.length} file{noteFiles.length === 1 ? "" : "s"} selected
                  </p>
                )}
              </div>
              {noteFormError && (
                <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                  {noteFormError}
                </p>
              )}
              <button
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSubmittingNote}
                type="submit"
              >
                {isSubmittingNote
                  ? noteFiles.length > 0
                    ? "Saving and uploading..."
                    : "Saving..."
                  : "Add note"}
              </button>
            </form>
            {noteDeleteError && (
              <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                {noteDeleteError}
              </p>
            )}
            {customer.notes.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">No notes recorded.</p>
            ) : (
              <ul className="mt-4 divide-y divide-slate-100">
                {customer.notes.map((note) => (
                  <li className="py-5 first:pt-0 last:pb-0" key={note.id}>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                      <span className="font-medium text-slate-900">{note.author}</span>
                      <span>&middot;</span>
                      <span>{note.category}</span>
                      {note.importance && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                          Important
                        </span>
                      )}
                      <button
                        className="ml-auto rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={deletingNoteId !== null}
                        onClick={() => void handleNoteDelete(note.id)}
                        type="button"
                      >
                        {deletingNoteId === note.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                    <div className="mt-3 text-sm leading-6 text-slate-700">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          strong: ({ children }) => (
                            <strong className="font-semibold text-slate-900">
                              {children}
                            </strong>
                          ),
                          ul: ({ children }) => (
                            <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0">
                              {children}
                            </ul>
                          ),
                          a: ({ children, ...props }) => (
                            <a
                              {...props}
                              className="text-slate-700 underline hover:text-slate-900"
                              rel="noreferrer"
                              target="_blank"
                            >
                              {children}
                            </a>
                          ),
                        }}
                      >
                        {note.text}
                      </ReactMarkdown>
                    </div>
                    {note.attachments.length > 0 && (
                      <ul className="mt-3 space-y-1 text-sm">
                        {note.attachments.map((attachment) => (
                          <li key={attachment.id}>
                            <a
                              className="text-slate-700 underline hover:text-slate-900"
                              href={`/api/attachments/${attachment.id}`}
                            >
                              {attachment.fileName}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  );
}
