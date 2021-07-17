-- CreateTable
CREATE TABLE "Conlang" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "prefix" TEXT NOT NULL DEFAULT E'-',
    "suffix" TEXT NOT NULL DEFAULT E'-',
    "separator" TEXT NOT NULL DEFAULT E'... ',

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hint" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "hints" TEXT NOT NULL,
    "fromConlang" BOOLEAN NOT NULL,
    "conlangId" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Section" (
    "start" INTEGER NOT NULL,
    "end" INTEGER NOT NULL,
    "prefix" BOOLEAN NOT NULL,
    "suffix" BOOLEAN NOT NULL,
    "hintId" INTEGER NOT NULL,
    "areaStart" INTEGER NOT NULL,

    PRIMARY KEY ("hintId","areaStart","start")
);

-- CreateIndex
CREATE UNIQUE INDEX "Hint.conlangId_fromConlang_key_unique" ON "Hint"("conlangId", "fromConlang", "key");

-- CreateIndex
CREATE INDEX "Section.hintId_index" ON "Section"("hintId");

-- AddForeignKey
ALTER TABLE "Hint" ADD FOREIGN KEY ("conlangId") REFERENCES "Conlang"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section" ADD FOREIGN KEY ("hintId") REFERENCES "Hint"("id") ON DELETE CASCADE ON UPDATE CASCADE;
