-- AlterTable
ALTER TABLE "_BlockedUsers" ADD CONSTRAINT "_BlockedUsers_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_BlockedUsers_AB_unique";

-- AlterTable
ALTER TABLE "_ConversationParticipants" ADD CONSTRAINT "_ConversationParticipants_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ConversationParticipants_AB_unique";

-- AlterTable
ALTER TABLE "_UserFriends" ADD CONSTRAINT "_UserFriends_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_UserFriends_AB_unique";
