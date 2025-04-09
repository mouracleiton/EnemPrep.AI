pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

// This settings.gradle.kts file is maintained for compatibility
// The actual settings are managed in the .gradle file
include(":app")
rootProject.name = "enemprep_flutter"
