package com.musicplayer

import android.media.audiofx.BassBoost
import android.media.audiofx.Equalizer
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap

/**
 * BEST-EFFORT equalizer / bass boost.
 *
 * RNTP does not expose the ExoPlayer audio session id it plays on, so this
 * attaches to Android's global session (id 0) instead of the app's exact
 * session. On most phones/Android versions that still applies system-wide
 * while this app is the one actively playing audio, but it is NOT guaranteed
 * on every device (some OEMs / Android 12+ sandbox effects per-app-session).
 * Treat this as "works on many phones", not "works everywhere" — test on
 * your target device before relying on it.
 */
class AudioEffectsModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  private var equalizer: Equalizer? = null
  private var bassBoost: BassBoost? = null

  override fun getName() = "AudioEffectsModule"

  @ReactMethod
  fun attach(promise: Promise) {
    try {
      val eq = Equalizer(0, 0)
      eq.enabled = true
      equalizer = eq

      val bb = BassBoost(0, 0)
      bb.enabled = true
      bassBoost = bb

      promise.resolve(describeEqualizer(eq))
    } catch (e: Exception) {
      promise.reject("ATTACH_FAILED", "Could not attach audio effects on this device", e)
    }
  }

  @ReactMethod
  fun detach(promise: Promise) {
    try {
      equalizer?.release()
      bassBoost?.release()
      equalizer = null
      bassBoost = null
      promise.resolve(null)
    } catch (e: Exception) {
      promise.reject("DETACH_FAILED", e)
    }
  }

  /** strength: 0-1000 (0 = off, 1000 = max boost) */
  @ReactMethod
  fun setBassBoostStrength(strength: Int, promise: Promise) {
    val bb = bassBoost
    if (bb == null) {
      promise.reject("NOT_ATTACHED", "Call attach() first")
      return
    }
    try {
      bb.setStrength(strength.toShort())
      promise.resolve(null)
    } catch (e: Exception) {
      promise.reject("SET_FAILED", e)
    }
  }

  /** level is in millibels, within the range returned by attach()'s bandLevelRange. */
  @ReactMethod
  fun setBandLevel(band: Int, level: Int, promise: Promise) {
    val eq = equalizer
    if (eq == null) {
      promise.reject("NOT_ATTACHED", "Call attach() first")
      return
    }
    try {
      eq.setBandLevel(band.toShort(), level.toShort())
      promise.resolve(null)
    } catch (e: Exception) {
      promise.reject("SET_FAILED", e)
    }
  }

  @ReactMethod
  fun usePreset(presetIndex: Int, promise: Promise) {
    val eq = equalizer
    if (eq == null) {
      promise.reject("NOT_ATTACHED", "Call attach() first")
      return
    }
    try {
      eq.usePreset(presetIndex.toShort())
      promise.resolve(null)
    } catch (e: Exception) {
      promise.reject("SET_FAILED", e)
    }
  }

  private fun describeEqualizer(eq: Equalizer): WritableMap {
    val map = Arguments.createMap()
    val bandCount = eq.numberOfBands.toInt()
    val range = eq.bandLevelRange
    map.putInt("bandCount", bandCount)
    map.putInt("minLevel", range[0].toInt())
    map.putInt("maxLevel", range[1].toInt())

    val bands: WritableArray = Arguments.createArray()
    for (i in 0 until bandCount) {
      val band = i.toShort()
      val bandMap = Arguments.createMap()
      bandMap.putInt("index", i)
      bandMap.putInt("centerFreqHz", eq.getCenterFreq(band) / 1000)
      bandMap.putInt("level", eq.getBandLevel(band).toInt())
      bands.pushMap(bandMap)
    }
    map.putArray("bands", bands)

    val presets: WritableArray = Arguments.createArray()
    for (i in 0 until eq.numberOfPresets.toInt()) {
      presets.pushString(eq.getPresetName(i.toShort()))
    }
    map.putArray("presets", presets)

    return map
  }
}
