package me.atsteffe.repository

import me.atsteffe.model.Bookmark
import me.atsteffe.util.MAX_VARCHAR_LENGTH
import org.jetbrains.exposed.dao.id.UUIDTable
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.ReferenceOption
import org.jetbrains.exposed.sql.ResultRow
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.deleteWhere
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.update
import java.util.UUID

object BookmarksTable : UUIDTable("bookmarks") {
    val userId = uuid("user_id").references(UsersTable.id, onDelete = ReferenceOption.CASCADE)
    val url = varchar("url", 2 * MAX_VARCHAR_LENGTH)
    val title = varchar("title", MAX_VARCHAR_LENGTH).nullable()
    val description = text("description").nullable()

    init {
        uniqueIndex(url, userId) // Prevent same user from having duplicate URLs
    }
}

class BookmarkRepository(private val database: Database) {
    fun findAll(userId: UUID): List<Bookmark> = transaction(database) {
        BookmarksTable.selectAll().where { BookmarksTable.userId eq userId }.map { toBookmark(it) }
    }

    fun findById(id: UUID, userId: UUID): Bookmark? = transaction(database) {
        BookmarksTable.selectAll().where { (BookmarksTable.userId eq userId) and (BookmarksTable.id eq id) }
            .map { toBookmark(it) }
            .singleOrNull()
    }

    fun findByUrl(url: String, userId: UUID): Bookmark? = transaction(database) {
        BookmarksTable.selectAll().where { (BookmarksTable.userId eq userId) and (BookmarksTable.url eq url) }
            .map { toBookmark(it) }.singleOrNull()
    }

    fun save(bookmark: Bookmark): Bookmark = transaction(database) {
        val existingBookmark = findById(bookmark.id, bookmark.userId)

        if (existingBookmark != null) {
            BookmarksTable.update({ (BookmarksTable.id eq existingBookmark.id) and (BookmarksTable.userId eq bookmark.userId) }) {
                it[url] = bookmark.url
                it[title] = bookmark.title
                it[description] = bookmark.description
            }
        } else {
            BookmarksTable.insert {
                it[id] = bookmark.id
                it[userId] = bookmark.userId
                it[url] = bookmark.url
                it[title] = bookmark.title
                it[description] = bookmark.description
            }
        }

        findById(bookmark.id, bookmark.userId)
            ?: throw IllegalStateException("Bookmark not found after save operation.")
    }

    fun delete(id: UUID, userId: UUID): Boolean = transaction(database) {
        BookmarksTable.deleteWhere {
            (BookmarksTable.id eq id) and (BookmarksTable.userId eq userId)
        } > 0
    }

    private fun toBookmark(row: ResultRow) = Bookmark(
        id = row[BookmarksTable.id].value,
        userId = row[BookmarksTable.userId],
        url = row[BookmarksTable.url],
        title = row[BookmarksTable.title],
        description = row[BookmarksTable.description]
    )
}