PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Attachment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fileName" TEXT NOT NULL,
    "storedName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "noteId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Attachment_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_Attachment" ("id", "fileName", "storedName", "mimeType", "size", "noteId")
SELECT "id", "fileName", "filePath", "application/octet-stream", 0, "noteId"
FROM "Attachment";

DROP TABLE "Attachment";
ALTER TABLE "new_Attachment" RENAME TO "Attachment";

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
