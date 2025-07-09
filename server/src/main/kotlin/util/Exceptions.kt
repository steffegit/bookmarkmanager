package me.atsteffe.util

class BookmarkNotFoundException(message: String) : RuntimeException(message)
class DuplicateBookmarkUrlException(message: String) : RuntimeException(message)
class InvalidUrlException(message: String) : RuntimeException(message)