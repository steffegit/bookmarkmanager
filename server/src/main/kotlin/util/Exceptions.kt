package me.atsteffe.util

// Bookmark related exceptions
class BookmarkNotFoundException(message: String) : RuntimeException(message)
class DuplicateBookmarkUrlException(message: String) : RuntimeException(message)
class InvalidUrlException(message: String) : RuntimeException(message)

class UserAlreadyExists(message: String) : IllegalArgumentException(message)
class InvalidCredentials(message: String) : IllegalArgumentException(message)
