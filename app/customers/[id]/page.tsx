"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { useEffect, useState } from "react";

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
