const env = require('gulp-env');
const gulpif = require('gulp-if');
const gulp = require('gulp');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const cssnano = require('gulp-cssnano');
const sourcemaps = require('gulp-sourcemaps');
const clean = require('gulp-clean');
const browserSync = require('browser-sync').create();
const postcss = require('gulp-postcss');
const nested = require('postcss-nested');
const postcssShort = require('postcss-short');
const assets  = require('postcss-assets');
const postcssPresetEnv = require('postcss-preset-env');
const autoprefixer = require('autoprefixer');
const glob = require('glob');
//const handlebars = require('gulp-compile-handlebars');
const rename = require('gulp-rename');
const eslint = require('gulp-eslint');
const stylelint = require('stylelint');
const reporter = require('postcss-reporter');
const imagemin = require('gulp-imagemin');
const htmlmin = require('gulp-htmlmin');

const jsLintRules = require('./.eslintrc.json');
const cssLintRules = require('./.stylelintrc');
//const templateContext = require('./src/user.json');
const filePath = {
    assets: ['./src/images/*.png', './src/images/*.jpg', 'src/images/*.jpg', 'src/images/*.png'],
    buildNames: {
        styles: 'index.min.css',
        scripts: 'index.min.js'
    },
    contextJson: '**/*.json',
    dir: {
        main: './',
        prod: './build'
    },
    handlebars: './**/*.hbs',
    css: {
        src: ['./src/**/*.css','./*.css', './templates/**/*.css'],
        dest: './build/css'
    },
    js: {
        src: './src/**/*.js',
        dest: './build/js',
    },
    lint: {
        css: ['**/*.css', '!node_modules/**/*', '!build/**/*'],
        scripts: ['**/*.js', '!node_modules/**/*', '!build/**/*']
    },
    templates:'./templates/**/*.hbs'
};

env({
    file: '.env',
    type: 'ini',
});

// gulp.task('compile',() => {
//     glob(filePath.templates, (err, files) => {
//         if (!err) {
//             const options = {
//                 ignorePartials: true,
//                 batch : files.map(item => item.slice(0, item.lastIndexOf('/'))),
//                 helpers: {
//                     upper:  name =>  name.toUpperCase(),
//                 }
//             };
//             return gulp.src('./templates/index.hbs')
//                 .pipe(handlebars(templateContext, options))
//                 .pipe(rename('index.html'))
//                 .pipe(gulp.dest(filePath.dir.prod));
//         }
//         else {
//             console.error('something wrong with hbs templates' + err);
//         }
//     });
// });

gulp.task('csslint', () => {
    gulp.src(filePath.lint.css)
        .pipe(postcss([
            stylelint(cssLintRules),
            reporter({
                clearAllMessages: true,
                throwError: false
            })
        ]))
});

gulp.task('eslint', () => {
    gulp.src(filePath.lint.scripts)
        .pipe(eslint(jsLintRules))
        .pipe(eslint.format());
});

gulp.task('lint', ['eslint', 'csslint']);


gulp.task('htmlminify', ['copy-files'], () => {
    return gulp.src(`${filePath.dir.main}/src/*.html`)
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest(filePath.dir.prod));
});

gulp.task('copy-files', () => {
    return gulp.src(`${filePath.dir.main}/src/*.json`)
        .pipe(gulp.dest(filePath.dir.prod));
});


gulp.task('build-css', () => {
    const plugins = [
        nested,
        postcssShort({
            skip: '-'
        }),
        assets,
        postcssPresetEnv({
            browsers: 'last 2 versions'
        }),
        autoprefixer
    ];
    return gulp.src(filePath.css.src)
        .pipe(sourcemaps.init())
        .pipe(postcss(plugins))
        .pipe(concat(filePath.buildNames.styles))
        .pipe(gulpif(process.env.NODE_ENV === 'production',cssnano()))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(filePath.css.dest))
});

gulp.task('build-js', () => {
    return gulp.src(filePath.js.src)
        .pipe(sourcemaps.init())
        .pipe(babel({presets: ['@babel/env']}))
        .pipe(concat(filePath.buildNames.scripts))
        .pipe(gulpif(process.env.NODE_ENV === 'production', uglify()))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(filePath.js.dest))
});

gulp.task('fonts', () => {
    gulp.src('./src/font**/*')
        .pipe(gulp.dest(`${filePath.dir.prod}`));
});

gulp.task('images', () => {
    gulp.src('src/images/**/*')
        .pipe(imagemin({
            verbose: true
        }))
        .pipe(gulp.dest(`${filePath.dir.prod}/images`));
});

gulp.task('icons', () => {
    gulp.src('src/icons/**/*')
        .pipe(imagemin({
            verbose: true
        }))
        .pipe(gulp.dest(`${filePath.dir.prod}/`));
});


gulp.task('clean-html', () => {
    return gulp.src('./build/*.html', {read: false})
        .pipe(clean());
});

gulp.task('clean-css', () => {
    return gulp.src('./build/css', {read: false})
        .pipe(clean());
});

gulp.task('clean-js', () => {
    return gulp.src('./build/js', {read: false})
        .pipe(clean());
});

gulp.task('assets', () => {
    glob(filePath.assets, (err, files) => {
        if (!err) {
            gulp.src(files)
                .pipe(gulp.dest(`${filePath.dir.prod}/assets`));
        } else {
            throw err;
        }
    });
});

gulp.task('browser-sync',  () => {
    browserSync.init({
        server: {
            baseDir: './build'
        },
        notify: true
    });
    gulp.watch(`${filePath.dir.main}/src/`, ['html-watch']);
    gulp.watch(filePath.css.src, ['css-watch']);
    gulp.watch(filePath.js.src, ['js-watch']);
    //gulp.watch(filePath.handlebars, ['compile']);
    gulp.watch(`${filePath.dir.main}/src/**.*`)
        .on('change', browserSync.reload);
});


gulp.task('html-watch', ['clean-html', 'htmlminify'], function (done) {
    browserSync.reload();
    done();
});

gulp.task('css-watch', ['clean-css', 'build-css'], function (done) {
    browserSync.reload();
    done();
});

gulp.task('js-watch', ['clean-js', 'build-js'], function (done) {
    browserSync.reload();
    done();
});

(imagemin({
    verbose: true
}));

gulp.task('build', ['clean-html', 'clean-css', 'clean-js', 'fonts', 'images', 'icons', 'build-js', 'build-css', 'htmlminify']);
gulp.task('prod',['build']);
gulp.task('dev',['browser-sync', 'build']);


