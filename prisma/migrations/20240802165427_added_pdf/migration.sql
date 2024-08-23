-- CreateTable
CREATE TABLE "PdfDocument" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "data" BYTEA NOT NULL,

    CONSTRAINT "PdfDocument_pkey" PRIMARY KEY ("id")
);
