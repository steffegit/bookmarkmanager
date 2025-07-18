package me.atsteffe.command

import me.atsteffe.model.BookmarkRequest
import me.atsteffe.util.URL
import java.util.UUID

data class CreateBookmarkCommand(
    val userId: UUID,
    val url: URL,
    val title: String?,
    val description: String?
)

data class UpdateBookmarkCommand(
    val id: UUID,
    val userId: UUID,
    val url: URL?,
    val title: String?,
    val description: String?
)

fun BookmarkRequest.toCreateCommand(userId: UUID): CreateBookmarkCommand {
    return CreateBookmarkCommand(
        userId = userId,
        url = URL(this.url),
        title = this.title,
        description = this.description
    )
}

fun BookmarkRequest.toUpdateCommand(id: UUID, userId: UUID): UpdateBookmarkCommand {
    return UpdateBookmarkCommand(
        id = id,
        userId = userId,
        url = if (this.url.isNotBlank()) URL(this.url) else null,
        title = this.title,
        description = this.description
    )
} 