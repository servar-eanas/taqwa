plugins { id("com.android.application"); id("org.jetbrains.kotlin.android") }
android {
 namespace = "com.taqwa.app"
 compileSdk = 36
 defaultConfig { applicationId = "com.taqwa.app"; minSdk = 26; targetSdk = 36; versionCode = 1; versionName = "1.0.0" }
 compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
 kotlinOptions { jvmTarget = "17" }
}
dependencies {
 implementation("androidx.webkit:webkit:1.12.1")
 implementation("androidx.core:core-ktx:1.15.0")
 implementation("androidx.activity:activity-ktx:1.9.3")
}
val copyWebsiteAssets by tasks.registering(Copy::class) {
 val websiteRoot = rootProject.projectDir.parentFile
 from(websiteRoot) { include("*.html", "*.js", "*.css", "*.webmanifest", "*.json", "*.svg", "*.png", "*.webp", "*.jpg", "*.jpeg") }
 into(layout.projectDirectory.dir("src/main/assets"))
}
tasks.named("preBuild").configure { dependsOn(copyWebsiteAssets) }
