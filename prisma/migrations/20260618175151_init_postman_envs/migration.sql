-- DropIndex
DROP INDEX "Workspace_name_key";

-- AlterTable
ALTER TABLE "Collection" ADD COLUMN     "variables" JSONB DEFAULT '[]';

-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "globalVariables" JSONB DEFAULT '[]';

-- CreateTable
CREATE TABLE "Environment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "values" JSONB NOT NULL,
    "workspaceId" TEXT NOT NULL,

    CONSTRAINT "Environment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Environment" ADD CONSTRAINT "Environment_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
