# Troubleshooting: Not Seeing Enhancements

If you're only seeing a bar chart and not the enhanced features, follow these steps:

## Step 1: Clear Browser Cache

### Chrome/Edge:
1. Press `Ctrl + Shift + Delete`
2. Select "Cached images and files"
3. Time range: "All time"
4. Click "Clear data"
5. Hard refresh: `Ctrl + Shift + R` or `Ctrl + F5`

### Firefox:
1. Press `Ctrl + Shift + Delete`
2. Select "Cache"
3. Time range: "Everything"
4. Click "Clear Now"
5. Hard refresh: `Ctrl + Shift + R`

## Step 2: Restart Dev Server

1. **Stop the frontend dev server** (Ctrl+C in the terminal)
2. **Clear Vite cache:**
   ```bash
   cd frontend
   rmdir /s /q node_modules\.vite
   ```
3. **Restart the dev server:**
   ```bash
   npm run dev
   ```

## Step 3: Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for any red error messages
4. Common errors to check:
   - Import errors (module not found)
   - TypeScript errors
   - Component rendering errors

## Step 4: Verify Components Are Loading

You should see:
- ✅ **3 Enhanced KPI Cards** at the top (with colored borders and helper icons)
- ✅ **Pie Chart** on the left showing "Sessions by Status"
- ✅ **Bar Chart** on the right showing "Top Tenants" with rank badges

If you only see the bar chart, the pie chart might be failing silently.

## Step 5: Check Network Tab

1. Open DevTools → Network tab
2. Refresh the page
3. Look for failed requests (red status codes)
4. Check if `/api/v1/bi/query/sessions_by_status` is returning data

## Step 6: Manual Component Test

If still not working, check the browser console for these specific errors:

```javascript
// Check if components are imported correctly
// Open browser console and type:
import('./components/charts/StatusDistributionChart')
```

## Common Issues & Fixes

### Issue: "Module not found" errors
**Fix:** Restart dev server and clear Vite cache

### Issue: Charts not rendering
**Fix:** Check if data is being returned from API. Empty data arrays will show "No data available"

### Issue: Only seeing old components
**Fix:** Hard refresh browser (Ctrl+Shift+R) and clear cache

### Issue: TypeScript errors
**Fix:** Check terminal where dev server is running for compilation errors

## Expected Visual Result

After clearing cache and restarting, you should see:

1. **Top Section:** 3 enhanced metric cards with:
   - Colored left border
   - Large numbers
   - Helper tooltip icons (?) 
   - Subtext below numbers

2. **Charts Section:** 
   - **Left:** Pie chart with colored segments showing status distribution
   - **Right:** Horizontal bar chart showing top tenants with rank badges (#1, #2, #3)

3. **Bottom Section:** Quick Actions panel

If you're still only seeing the bar chart, the pie chart component might have an error. Check the browser console for specific error messages.
