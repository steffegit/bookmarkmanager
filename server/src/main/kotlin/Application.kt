package me.atsteffe

import io.ktor.server.application.*
import me.atsteffe.config.configureDependencyInjection

fun main(args: Array<String>) {
    io.ktor.server.netty.EngineMain.main(args)
}

fun Application.module() {
    configureDependencyInjection()
    configureLogging()
    configureSerialization()
    configureStatusPages()
    configureSecurity()
    configureRouting()
    configureCORS()
}
