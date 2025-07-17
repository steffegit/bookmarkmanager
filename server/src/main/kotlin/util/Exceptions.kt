package me.atsteffe.util

// Bookmark exceptions
class BookmarkNotFoundException(message: String) : RuntimeException(message)
class DuplicateBookmarkUrlException(message: String) : RuntimeException(message)
class InvalidUrlException(message: String) : RuntimeException(message)

// User & Auth exceptions
class UserAlreadyExists(message: String) : IllegalArgumentException(message)
class InvalidCredentials(message: String) : IllegalArgumentException(message)
class UnsupportedAuthenticationMethod(message: String) : IllegalArgumentException(message)
