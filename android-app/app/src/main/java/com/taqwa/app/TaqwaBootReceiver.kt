package com.taqwa.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class TaqwaBootReceiver : BroadcastReceiver() {
 override fun onReceive(context:Context,intent:Intent) {
  TaqwaAlarmScheduler.rescheduleFromPrefs(context)
  TaqwaAlarmScheduler.scheduleDailyRefresh(context)
 }
}