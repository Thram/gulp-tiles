# gulp-tiles

> Create tiles from image

### GraphicsMagick or ImageMagick
Make sure GraphicsMagick or ImageMagick is installed on your system and properly set up in your `PATH`.

Ubuntu:

```shell
apt-get install imagemagick
apt-get install graphicsmagick
```

Mac OS X (using [Homebrew](http://brew.sh/)):

```shell
brew install imagemagick
brew install graphicsmagick
```

Windows & others: 

[http://www.imagemagick.org/script/binary-releases.php](http://www.imagemagick.org/script/binary-releases.php)

Confirm that ImageMagick is properly set up by executing `convert -help` in a terminal.


## Example

```js
var gulp = require('gulp');
var createTiles = require('gulp-tiles');

gulp.task('default', function () {
  gulp.src('panorama.jpg')
    .pipe(createTiles({ 
      width: 512,
      height: 512,
      foramt: 'jpg'
    }))
    .pipe(gulp.dest('./images/tiles/'));
});
```

## API

### createTiles(options)

#### options.width

Type: `Number`  
Default value: `256` (only if height is defined)

Desired tile width in px.


#### options.height

Type: `Number`  
Default value: `256` (only if width is defined)

Desired tile height in px.


#### options.format

Type: `String`  
Default value: Format of the input file  
Possible values: `png`, `jpeg`.

Override the output format of the processed file.




