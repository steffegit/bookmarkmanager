package me.atsteffe.repository

import me.atsteffe.model.Bookmark
import me.atsteffe.util.MAX_VARCHAR_LENGTH
import org.jetbrains.exposed.dao.id.UUIDTable
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.ResultRow
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.deleteWhere
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.update
import java.util.UUID

object BookmarksTable : UUIDTable("bookmarks") {
    val url = varchar("url", MAX_VARCHAR_LENGTH)
    val title = varchar("title", MAX_VARCHAR_LENGTH).nullable()
    val description = text("description").nullable()
}

class BookmarkRepository(private val database: Database) {
    init {
        transaction(database) {
            SchemaUtils.create(BookmarksTable)
        }
    }

    fun findAll(): List<Bookmark> = transaction(database) {
        BookmarksTable.selectAll().map { toBookmark(it) }
    }

    fun findById(id: UUID): Bookmark? = transaction(database) {
        BookmarksTable.selectAll().where { BookmarksTable.id eq id }
            .map { toBookmark(it) }
            .singleOrNull()
    }

    fun findByUrl(url: String): Bookmark? = transaction(database) {
        BookmarksTable.selectAll().where { BookmarksTable.url eq url }
            .map { toBookmark(it) }.singleOrNull()
    }

    fun save(bookmark: Bookmark): Bookmark = transaction(database) {
        val existingBookmark = findById(bookmark.id)

        if (existingBookmark != null) {
            BookmarksTable.update({ BookmarksTable.id eq existingBookmark.id }) {
                it[url] = bookmark.url
                it[title] = bookmark.title
                it[description] = bookmark.description
            }
        } else {
            BookmarksTable.insert {
                it[id] = bookmark.id
                it[url] = bookmark.url
                it[title] = bookmark.title
                it[description] = bookmark.description
            }
        }

        findById(bookmark.id)
            ?: throw IllegalStateException("Bookmark with ID ${bookmark.id} not found after save operation.")
    }

    fun delete(id: UUID): Boolean = transaction(database) {
        BookmarksTable.deleteWhere {
            BookmarksTable.id eq id
        } > 0
    }

    private fun toBookmark(row: ResultRow) = Bookmark(
        id = row[BookmarksTable.id].value,
        url = row[BookmarksTable.url],
        title = row[BookmarksTable.title],
        description = row[BookmarksTable.description]
    )
}