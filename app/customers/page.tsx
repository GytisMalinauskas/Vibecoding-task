"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Customer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCustomers() {
      try {
        const response = await fetch("/api/customers");

        if (!response.ok) {
          throw new Error("Unable to load customers.");
        }

        setCustomers(await response.json());
      } catch (requestError) {
        console.error("Failed to load customers:", requestError);
        setError("Unable to load customers. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return customers;
    }

    return customers.filter((customer) =>
      customer.name.toLowerCase().includes(query),
    );
  }, [customers, search]);

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-12">
      <header className="mb-8">
        <p className="text-sm font-medium text-slate-500">Customer Notes</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
          Customers
        </h1>
        <p className="mt-2 text-slate-600">
          Select a customer to view their vehicles and internal notes.
        </p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <label
          className="block text-sm font-medium text-slate-700"
          htmlFor="customer-search"
        >
          Search customers
        </label>
        <input
          className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          id="customer-search"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name"
          type="search"
          value={search}
        />

        {isLoading && (
          <p className="mt-6 text-sm text-slate-500" role="status">
            Loading customers...
          </p>
        )}

        {!isLoading && error && (
          <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        {!isLoading && !error && filteredCustomers.length === 0 && (
          <p className="mt-6 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
            {search ? "No customers match your search." : "No customers found."}
          </p>
        )}

        {!isLoading && !error && filteredCustomers.length > 0 && (
          <ul className="mt-6 divide-y divide-slate-100">
            {filteredCustomers.map((customer) => (
              <li
                className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                key={customer.id}
              >
                <div>
                  <h2 className="font-medium text-slate-900">{customer.name}</h2>
                  {customer.email && (
                    <p className="mt-1 text-sm text-slate-500">{customer.email}</p>
                  )}
                </div>
                <Link
                  className="shrink-0 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                  href={`/customers/${customer.id}`}
                >
                  Open
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
