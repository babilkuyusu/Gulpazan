const { series, src, dest, watch } = require('gulp');
const nunjucksRender = require("gulp-nunjucks-render");
const browserSync = require("browser-sync");
const sass = require("gulp-sass");
const sourcemaps = require("gulp-sourcemaps");
const del = require('del');
const cache = require("gulp-cache");

// Nunjucks HTML templating engine
function nunjucks(done) {
  return src('src/pages/**/*.njk')
    .pipe(nunjucksRender({
      path: ["src/templates"]
    }))
    .pipe(dest("src/web"))
  done()
}

// Sass compiler
function sassify(done) {
  return src('src/web/assets/sass/**/*.scss')
    .pipe(sourcemaps.init())
    // gulp-sass kullanarak Sass dosyasını CSS'e çeviriyor. (nested, compact, expanded, compressed)
    .pipe(sass({ outputStyle: 'expanded' })).on('error', function swallowError(error) {
      console.log(error.toString());
      this.emit('end');
    })
    .pipe(sourcemaps.write())
    .pipe(dest('src/web/assets/css'))
    .pipe(browserSync.reload({ stream: true }))
  done()
}

function browser_sync(done) {
  browserSync.init({
    watch: true,
    server: { baseDir: 'src/web' },
    port: 8080
  })
  done()
}

// Moves all the Bootstrap related JavaScript files into the js folder
function bootstrapper(done) {
  return src(['node_modules/bootstrap/dist/js/bootstrap.js', 'node_modules/jquery/dist/jquery.js', 'node_modules/popper.js/dist/popper.js'])
    .pipe(dest('src/web/assets/js'))
    .pipe(browserSync.stream())
  done()
}

function html() {
  return src('src/web/*.html')
    .pipe(dest('dist'))
}

function images() {
  return src('src/web/assets/images/**/*.+(png|jpg|gif|svg)')
    .pipe(dest('dist/assets/images'))
}

function fonts() {
  return src('src/web/assets/fonts/**/*')
    .pipe(dest('dist/assets/fonts'))
}

function css() {
  return src('src/web/assets/css/**/*.css')
    .pipe(dest('dist/assets/css/'))
}

function js() {
  // The ordering is very important here!
  // First it moves all the js files
  // Second it overwrites the "scripts.js" file with the transpiled one
  return src('src/web/assets/js/**/*.js')
    .pipe(dest('dist/assets/js/'))
}

// Deletes the dist folder
function clean_dist() {
  return del('./dist');
}

// Cleans the cache
function clear_cache(done) {
  return cache.clearAll(done)
}

function watch_files(done) {
  watch('src/**/*.njk', nunjucks)
  watch('src/**/*.scss', sassify)
  watch('src/**/*.html', browserSync.reload)
  done()
}

exports.start = series(clear_cache, bootstrapper, browser_sync, sassify, nunjucks, watch_files);
exports.build = series(clean_dist, bootstrapper, js, sassify, css, images, fonts, html);