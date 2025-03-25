package com.kykyemek;

import android.app.Activity;
import android.appwidget.AppWidgetManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.RadioButton;
import android.widget.RadioGroup;
import android.widget.TextView;
import android.widget.Toast;

/**
 * The configuration screen for the MealWidget AppWidget.
 */
public class MealWidgetConfigureActivity extends Activity {

    private static final String PREFS_NAME = "com.kykyemek.MealWidget";
    private int mAppWidgetId = AppWidgetManager.INVALID_APPWIDGET_ID;
    
    public MealWidgetConfigureActivity() {
        super();
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Set the result to CANCELED. This will cause the widget host to cancel
        // out of the widget placement if the user presses the back button.
        setResult(RESULT_CANCELED);

        setContentView(R.layout.meal_widget_configure);
        
        // Find the widget id from the intent.
        Intent intent = getIntent();
        Bundle extras = intent.getExtras();
        if (extras != null) {
            mAppWidgetId = extras.getInt(
                    AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID);
        }

        // If this activity was started with an intent without an app widget ID, finish with an error.
        if (mAppWidgetId == AppWidgetManager.INVALID_APPWIDGET_ID) {
            finish();
            return;
        }
        
        // Set up the configuration view
        Button confirmButton = findViewById(R.id.confirm_button);
        confirmButton.setOnClickListener(v -> {
            final Context context = MealWidgetConfigureActivity.this;
            
            // When the button is clicked, save the preferences and configure the widget
            savePrefs();
            
            // Make sure we pass back the original appWidgetId
            Intent resultValue = new Intent();
            resultValue.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, mAppWidgetId);
            setResult(RESULT_OK, resultValue);
            
            // It is the responsibility of the configuration activity to update the app widget
            AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
            MealWidgetProvider.updateAppWidget(context, appWidgetManager, mAppWidgetId);
            
            finish();
        });
    }
    
    private void savePrefs() {
        // Get the preferences
        SharedPreferences.Editor prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE).edit();
        
        // Store widget-specific preferences (e.g., refresh interval, display options)
        // For now, we're just using default settings
        
        prefs.apply();
        
        // Also trigger a data load from the React Native side
        // This would be done via a broadcast intent that the React Native app would listen for
        Intent updateIntent = new Intent("com.kykyemek.WIDGET_DATA_REQUEST");
        updateIntent.putExtra("widgetId", mAppWidgetId);
        sendBroadcast(updateIntent);
    }
} 