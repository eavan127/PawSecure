// Root-level build.gradle.kts
allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

// Ensure the build directory is handled consistently
val newBuildDir: DirectoryProperty = layout.buildDirectory
rootProject.layout.buildDirectory.set(file("${project.rootDir}/../build"))

subprojects {
    val newSubprojectBuildDir = file("${rootProject.layout.buildDirectory.get()}/${project.name}")
    project.layout.buildDirectory.set(newSubprojectBuildDir)
}

subprojects {
    project.evaluationDependsOn(":app")
}

tasks.register<Delete>("clean") {
    delete(rootProject.layout.buildDirectory)
}