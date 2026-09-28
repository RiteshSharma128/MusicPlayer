package com.musicplayer

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.view.KeyEvent
import android.widget.RemoteViews

/**
 * Home-screen widget: shows the last-known title/artist (pushed from JS via
 * WidgetModule) and forwards play/pause/next/previous as standard
 * ACTION_MEDIA_BUTTON intents. Media3 (which @rntp/player is built on)
 * auto-registers a media-button receiver for the app's active session, so
 * these are picked up the same way a Bluetooth headset button would be —
 * no direct coupling to RNTP internals needed.
 *
 * Tapping the widget's body/artwork opens the app.
 */
class MusicWidgetProvider : AppWidgetProvider() {

  companion object {
    const val PREFS_NAME = "MusicWidgetPrefs"
    const val KEY_TITLE = "title"
    const val KEY_ARTIST = "artist"

    fun updateAll(context: Context) {
      val mgr = AppWidgetManager.getInstance(context)
      val ids = mgr.getAppWidgetIds(android.content.ComponentName(context, MusicWidgetProvider::class.java))
      if (ids.isNotEmpty()) {
        MusicWidgetProvider().onUpdate(context, mgr, ids)
      }
    }
  }

  override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
    val prefs: SharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    val title = prefs.getString(KEY_TITLE, null) ?: "Not playing"
    val artist = prefs.getString(KEY_ARTIST, "")

    for (id in appWidgetIds) {
      val views = RemoteViews(context.packageName, R.layout.widget_music)
      views.setTextViewText(R.id.widget_title, title)
      views.setTextViewText(R.id.widget_artist, artist)

      views.setOnClickPendingIntent(R.id.widget_root, openAppIntent(context))
      views.setOnClickPendingIntent(R.id.widget_prev, mediaButtonIntent(context, KeyEvent.KEYCODE_MEDIA_PREVIOUS, 1))
      views.setOnClickPendingIntent(R.id.widget_play_pause, mediaButtonIntent(context, KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE, 2))
      views.setOnClickPendingIntent(R.id.widget_next, mediaButtonIntent(context, KeyEvent.KEYCODE_MEDIA_NEXT, 3))

      appWidgetManager.updateAppWidget(id, views)
    }
  }

  private fun openAppIntent(context: Context): PendingIntent {
    val launch = context.packageManager.getLaunchIntentForPackage(context.packageName)
    return PendingIntent.getActivity(
      context, 0, launch,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )
  }

  private fun mediaButtonIntent(context: Context, keyCode: Int, requestCode: Int): PendingIntent {
    val intent = Intent(Intent.ACTION_MEDIA_BUTTON).apply {
      setPackage(context.packageName)
      putExtra(Intent.EXTRA_KEY_EVENT, KeyEvent(KeyEvent.ACTION_DOWN, keyCode))
    }
    return PendingIntent.getBroadcast(
      context, requestCode, intent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )
  }
}
