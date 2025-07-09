package me.atsteffe.service

import com.fleeksoft.ksoup.Ksoup
import com.fleeksoft.ksoup.network.parseGetRequestBlocking
import me.atsteffe.model.Bookmark
import me.atsteffe.repository.BookmarkRepository
import me.atsteffe.util.BookmarkNotFoundException
import me.atsteffe.util.DuplicateBookmarkUrlException
import me.atsteffe.util.InvalidUrlException
import java.util.UUID
import java.util.regex.Pattern

class BookmarkService(private val bookmarkRepository: BookmarkRepository) {
    fun createBookmark(url: String, title: String?, description: String?): Bookmark {
        if (url.isBlank()) throw InvalidUrlException("URL cannot be empty.")

        if (!isValidUrl(url))
            throw InvalidUrlException("Invalid URL format.")

        if (bookmarkRepository.findByUrl(url) != null) {
            throw DuplicateBookmarkUrlException("A bookmark with this URL already exists.")
        }

        // For later: if we decide do create a chrome extension, we can get this information directly from the page
        val actualTitle = fetchTitleFromUrl(url) ?: title

        val newBookmark = Bookmark(url = url, title = actualTitle, description = description)

        return bookmarkRepository.save(newBookmark)
    }

    fun getAllBookmarks() = bookmarkRepository.findAll()

    fun updateBookmark(
        id: UUID,
        url: String? = null,
        title: String? = null,
        description: String? = null
    ): Bookmark {
        val existingBookmark =
            bookmarkRepository.findById(id) ?: throw BookmarkNotFoundException("Bookmark with $id not found.")

        val updatedBookmark = existingBookmark.copy(
            url = url ?: existingBookmark.url,
            title = title ?: existingBookmark.title,
            description = description ?: existingBookmark.description
        )

        // Re-validate URL
        if (url != null && url != existingBookmark.url) {
            if (url.isBlank()) throw InvalidUrlException("URL cannot be empty.")

            if (!isValidUrl(url))
                throw InvalidUrlException("Invalid URL format.")
        }

        return bookmarkRepository.save(updatedBookmark)
    }

    fun deleteBookmark(id: UUID): Boolean {
        if (bookmarkRepository.findById(id) == null) {
            throw BookmarkNotFoundException("Bookmark with $id not found.")
        }

        return bookmarkRepository.delete(id)
    }

    fun findById(id: UUID): Bookmark? {
        return bookmarkRepository.findById(id)
    }

    private fun isValidUrl(url: String): Boolean {
        val urlRegex = ("^(https?://)?" + // optional http or https
                "([\\w-]+\\.)+[\\w-]+" + // domain name
                "(:\\d+)?(/\\S*)?$") // optional port and path

        val pattern = Pattern.compile(urlRegex, Pattern.CASE_INSENSITIVE)
        return pattern.matcher(url).matches()
    }

    private fun fetchTitleFromUrl(url: String): String? {
        val doc: com.fleeksoft.ksoup.nodes.Document = Ksoup.parseGetRequestBlocking(url)

        return doc.title()
    }
}