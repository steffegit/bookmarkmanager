package me.atsteffe.model

import kotlinx.serialization.Serializable
import me.atsteffe.util.UUIDSerializer
import java.util.UUID

data class Bookmark(
    val id: UUID = UUID.randomUUID(),
    val userId: UUID,
    val url: String,
    val title: String?,
    val description: String?,
//    val tags: List<String> = emptyList()
)

@Serializable
data class BookmarkRequest(
    val url: String,
    val title: String?,
    val description: String?
)

@Serializable
data class BookmarkResponse(
    @Serializable(with = UUIDSerializer::class)
    val id: UUID,
    val url: String,
    val title: String?,
    val description: String?
)

fun Bookmark.toResponse(): BookmarkResponse {
    return BookmarkResponse(
        id = this.id,
        url = this.url,
        title = this.title,
        description = this.description
    )
}