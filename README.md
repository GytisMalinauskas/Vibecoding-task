# Vibecoding-task

`CHATGPT` was used to generate prompts, `Copilot` was used for vibecoding tasks.

### Stack
+ Next.js
+ TypeScript
+ Prisma
+ SQLite
+ Tailwind
+ React

### Requirements
* Node.js
* npm
* Git

### Structure
```
customer-notes/
│
├── app/
│   ├── page.tsx
│   ├── customers/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   │
│   ├── api/
│   │   ├── customers/
│   │   │   └── route.ts
│   │   └── notes/
│   │       ├── route.ts
│   │       └── [id]/
│   │           └── route.ts
│   │
│   └── attachments/
│       └── [id]/
│           └── route.ts
│
├── components/
│   ├── CustomerList.tsx
│   ├── CustomerDetails.tsx
│   ├── NotesList.tsx
│   ├── NoteForm.tsx
│   └── LoadingState.tsx
│
├── lib/
│   └── prisma.ts
│
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── dev.db
│
├── uploads/
│
├── public/
│
├── README.md
├── TRANSCRIPT
├── package.json
├── .gitignore
└── ...
```

### How to Run

```bash
npm install
npx prisma migrate deploy
npm run dev
```

Open http://localhost:3000.