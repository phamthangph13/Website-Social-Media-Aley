# Aley Social Media Website

## Sidebar Components

### Overview
This project includes reusable sidebar components that can be easily added to any page of the Aley social media website. The sidebar components have been extracted into separate files for better modularity and easier maintenance.

### Files Structure
- `Page/sidebar-menu.html` - Contains the HTML for the left sidebar menu
- `Scripts/sidebar-loader.js` - JavaScript to load and initialize the left sidebar menu
- `Page/right-sidebar.html` - Contains the HTML for the right sidebar
- `Scripts/right-sidebar-loader.js` - JavaScript to load and initialize the right sidebar
- `Page/template.html` - Example template showing how to use the sidebar components

### How to Use in a New Page

#### Left Sidebar
1. Add a container with the class `sidebar-container` in your HTML where you want the left sidebar to appear:

```html
<div class="sidebar-container"></div>
```

2. Include the sidebar-loader.js script in your HTML:

```html
<!-- If your HTML file is in the Page directory -->
<script src="../Scripts/sidebar-loader.js"></script>
```

#### Right Sidebar
1. Add a container with the class `right-sidebar-container` in your HTML where you want the right sidebar to appear:

```html
<div class="right-sidebar-container"></div>
```

2. Include the right-sidebar-loader.js script in your HTML:

```html
<!-- If your HTML file is in the Page directory -->
<script src="../Scripts/right-sidebar-loader.js"></script>
```

3. Make sure your page structure follows the same pattern as in the template:

```html
<div class="container">
    <!-- Left sidebar container -->
    <div class="sidebar-container"></div>
    
    <!-- Main content -->
    <main class="main-content">
        <!-- Your page content -->
    </main>
    
    <!-- Right sidebar container -->
    <div class="right-sidebar-container"></div>
</div>
```

### Path Considerations
- If your HTML file is in the `Page/` directory, use `../Scripts/sidebar-loader.js` and `../Scripts/right-sidebar-loader.js` to load the scripts
- The loader scripts are configured to look for the HTML files at the correct relative paths
- If you move files to different directories, make sure to adjust these paths accordingly

### Customizing the Sidebars
To make changes to the sidebars:
1. Edit the `Page/sidebar-menu.html` or `Page/right-sidebar.html` files
2. The changes will be reflected in all pages that use these sidebar components

### Troubleshooting
If the sidebars don't appear:
- Check browser console for errors
- Ensure the paths to the loader scripts and HTML files are correct
- Verify that you have containers with the correct classes in your HTML 