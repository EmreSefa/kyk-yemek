package com.kykyemek;

import android.appwidget.AppWidgetManager;
import android.content.BroadcastReceiver;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

/**
 * BroadcastReceiver that gets triggered when the device boots,
 * used to refresh/update widgets after device restart.
 */
public class BootCompletedReceiver extends BroadcastReceiver {
    private static final String TAG = "BootCompletedReceiver";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent.getAction() != null && intent.getAction().equals(Intent.ACTION_BOOT_COMPLETED)) {
            Log.d(TAG, "Boot completed, updating widgets");
            
            // Get all active widget ids
            AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
            ComponentName thisWidget = new ComponentName(context, MealWidgetProvider.class);
            int[] appWidgetIds = appWidgetManager.getAppWidgetIds(thisWidget);
            
            if (appWidgetIds != null && appWidgetIds.length > 0) {
                // Request widget updates
                Intent updateIntent = new Intent(context, MealWidgetProvider.class);
                updateIntent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
                updateIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, appWidgetIds);
                context.sendBroadcast(updateIntent);
                
                // Also trigger a data refresh request to the React Native app
                Intent rnIntent = new Intent("com.kykyemek.WIDGET_DATA_REQUEST");
                context.sendBroadcast(rnIntent);
            }
        }
    }
} 