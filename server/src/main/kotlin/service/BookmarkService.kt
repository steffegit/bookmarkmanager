package me.atsteffe.service

import com.fleeksoft.ksoup.Ksoup
import com.fleeksoft.ksoup.network.parseGetRequestBlocking
import com.fleeksoft.ksoup.nodes.Document
import kotlinx.serialization.Serializable
import kotlinx.serialization.builtins.ListSerializer
import me.atsteffe.model.Bookmark
import me.atsteffe.command.CreateBookmarkCommand
import me.atsteffe.command.UpdateBookmarkCommand
import me.atsteffe.repository.BookmarkRepository
import me.atsteffe.util.BookmarkNotFoundException
import me.atsteffe.util.DuplicateBookmarkUrlException
import java.util.UUID

@Serializable
data class ParsedData(
    val title: String?,
    val ogImageURL: String?
)

class BookmarkService(
    private val bookmarkRepository: BookmarkRepository,
    private val cache: CacheService,
) {
    private fun bookmarksKey(userId: UUID) = "bookmarks:user:$userId"

    private fun urlMetaKey(url: String) = "urlmeta:$url"

    fun createBookmark(command: CreateBookmarkCommand): Bookmark {
        bookmarkRepository.findByUrl(command.url.toString(), command.userId)
            ?.let { throw DuplicateBookmarkUrlException("A bookmark with this URL already exists.") }

        // For later: if we decide do create a chrome extension, we can get this information directly from the page
        val data = fetchDataFromUrl(command.url.toString())
        val actualTitle = data.title ?: command.title
        val ogImageUrl = data.ogImageURL

        val newBookmark = Bookmark(
            userId = command.userId,
            url = command.url.toString(),
            title = actualTitle,
            description = command.description,
            ogImageUrl = ogImageUrl
        )

        val saved = bookmarkRepository.save(newBookmark)
        cache.delete(bookmarksKey(command.userId))
        return saved
    }

    fun getAllBookmarks(userId: UUID): List<Bookmark> {
        val key = bookmarksKey(userId)
        cache.get(key, ListSerializer(Bookmark.serializer()))?.let { return it }

        val bookmarks = bookmarkRepository.findAll(userId)
        cache.set(key, bookmarks, ListSerializer(Bookmark.serializer()), ttlSeconds = 300)
        return bookmarks
    }

    fun updateBookmark(command: UpdateBookmarkCommand): Bookmark {
        val existingBookmark =
            bookmarkRepository.findById(command.id, command.userId)
                ?: throw BookmarkNotFoundException("Bookmark with ${command.id} not found.")

        val updatedBookmark = existingBookmark.copy(
            url = command.url?.toString() ?: existingBookmark.url,
            title = command.title ?: existingBookmark.title,
            description = command.description ?: existingBookmark.description
        )

        val saved = bookmarkRepository.save(updatedBookmark)
        cache.delete(bookmarksKey(command.userId))
        return saved
    }

    fun deleteBookmark(id: UUID, userId: UUID): Boolean {
        bookmarkRepository.findById(id, userId) ?: throw BookmarkNotFoundException("Bookmark with $id not found.")

        val deleted = bookmarkRepository.delete(id, userId)
        cache.delete(bookmarksKey(userId))
        return deleted
    }

    fun findById(id: UUID, userId: UUID): Bookmark? {
        return bookmarkRepository.findById(id, userId)
    }

    private fun fetchDataFromUrl(url: String): ParsedData {
        val key = urlMetaKey(url)
        cache.get(key, ParsedData.serializer())?.let { return it }

        val parsed = try {
            val doc: Document = Ksoup.parseGetRequestBlocking(url)
            val title = doc.title().takeIf { it.isNotBlank() }
            val ogImageUrl = doc.selectFirst("meta[property=og:image]")
                ?.attr("content")
                ?.takeIf { it.isNotBlank() }
            ParsedData(title, ogImageUrl)
        } catch (e: Exception) {
            ParsedData(null, null)
        }

        // Cache page metadata for 7 days to avoid re-fetching the same URL.
        cache.set(key, parsed, ParsedData.serializer(), ttlSeconds = 7 * 24 * 3600)
        return parsed
    }

}