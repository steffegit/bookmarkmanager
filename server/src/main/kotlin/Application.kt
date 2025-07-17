package me.atsteffe

import io.ktor.server.application.*

fun main(args: Array<String>) {
    io.ktor.server.netty.EngineMain.main(args)
}

fun Application.module() {
    configureLogging()
    configureTemplating()
    configureSerialization()
    configureDatabases()
    configureStatusPages()
    configureSecurity()
    configureRouting()
}
