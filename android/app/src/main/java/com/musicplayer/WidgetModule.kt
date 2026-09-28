package com.musicplayer

import android.content.Context
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

/** JS -> native bridge so the home-screen widget can show the current song. */
class WidgetModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName() = "WidgetModule"

  @ReactMethod
  fun updateNowPlaying(title: String, artist: String, promise: Promise) {
    try {
      val prefs = reactApplicationContext.getSharedPreferences(
        MusicWidgetProvider.PREFS_NAME,
        Context.MODE_PRIVATE,
      )
      prefs.edit()
        .putString(MusicWidgetProvider.KEY_TITLE, title)
        .putString(MusicWidgetProvider.KEY_ARTIST, artist)
        .apply()
      MusicWidgetProvider.updateAll(reactApplicationContext)
      promise.resolve(null)
    } catch (e: Exception) {
      promise.reject("UPDATE_FAILED", e)
    }
  }
}
