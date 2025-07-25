package me.atsteffe.service

import com.fleeksoft.ksoup.Ksoup
import com.fleeksoft.ksoup.network.parseGetRequestBlocking
import com.fleeksoft.ksoup.nodes.Document
import me.atsteffe.model.Bookmark
import me.atsteffe.command.CreateBookmarkCommand
import me.atsteffe.command.UpdateBookmarkCommand
import me.atsteffe.repository.BookmarkRepository
import me.atsteffe.util.BookmarkNotFoundException
import me.atsteffe.util.DuplicateBookmarkUrlException
import java.util.UUID

data class ParsedData(
    val title: String?,
    val ogImageURL: String?
)

class BookmarkService(private val bookmarkRepository: BookmarkRepository) {
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

        return bookmarkRepository.save(newBookmark)
    }

    fun getAllBookmarks(userId: UUID) = bookmarkRepository.findAll(userId)

    fun updateBookmark(command: UpdateBookmarkCommand): Bookmark {
        val existingBookmark =
            bookmarkRepository.findById(command.id, command.userId)
                ?: throw BookmarkNotFoundException("Bookmark with ${command.id} not found.")

        val updatedBookmark = existingBookmark.copy(
            url = command.url?.toString() ?: existingBookmark.url,
            title = command.title ?: existingBookmark.title,
            description = command.description ?: existingBookmark.description
        )

        return bookmarkRepository.save(updatedBookmark)
    }

    fun deleteBookmark(id: UUID, userId: UUID): Boolean {
        bookmarkRepository.findById(id, userId) ?: throw BookmarkNotFoundException("Bookmark with $id not found.")

        return bookmarkRepository.delete(id, userId)
    }

    fun findById(id: UUID, userId: UUID): Bookmark? {
        return bookmarkRepository.findById(id, userId)
    }

    private fun fetchDataFromUrl(url: String): ParsedData {
        val doc: Document = Ksoup.parseGetRequestBlocking(url)

        val title = doc.title()

        // Grab the meta tag that has property="og:image" and grab the content attribute

        val ogImageUrl = doc.selectFirst("meta[property=og:image]")?.attr("content") ?: ""

        return ParsedData(
            title,
            ogImageUrl
        )

    }

    private fun fetchTitleFromUrl(url: String): String? {
        val doc: Document = Ksoup.parseGetRequestBlocking(url)

        return doc.title()
    }

}