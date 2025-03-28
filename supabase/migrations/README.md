# KYK Yemek Menu Data Import

This directory contains files and scripts for importing KYK meal data into the Supabase database.

## Files Overview

- **menu_data_20250323_214545.csv**: The source CSV file containing the meal data
- **fixed_sql_import.sql**: A SQL file with properly formatted Turkish characters
- **direct_sql_import.sql**: Full SQL import file generated by the script
- **sql_import_instructions.html**: Interactive HTML instructions for importing

## Import Options

You have several options for importing the data:

### Option 1: Using the Interactive HTML Instructions

1. Open the `sql_import_instructions.html` file in your browser
2. Follow the step-by-step instructions
3. Use the "Copy" buttons to copy SQL statements
4. Paste into the Supabase SQL Editor

### Option 2: Directly Using the Generated SQL File

1. Open the `fixed_sql_import.sql` file
2. Copy the entire content
3. Paste into the Supabase SQL Editor

### Option 3: Generate a Custom SQL Import File

1. Run `node scripts/sql-direct-import.js` to generate a SQL file
2. Use the generated `direct_sql_import.sql` file

## Important Notes

- The import process properly handles Turkish characters
- The import process converts dates from Turkish format (1 Mart 2025 Cumartesi) to ISO format (2025-03-01)
- Menu items are stored as semicolon-separated text in the `menu_items_text` column
- In your frontend code, you can split this text using `meal.menu_items_text.split(';').map(item => item.trim())`

## Batch File Helper

For your convenience, you can run `open_sql_instructions.bat` at the root of the project to open the interactive HTML instructions.
